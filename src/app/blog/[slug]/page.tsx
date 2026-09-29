import { mdxComponents } from "@/components/blog/mdx";
import { Footer } from "@/components/sections/footer";
import { DATA } from "@/data/resume";
import { SITE_URL } from "@/lib/site";
import { formatPostDate, getPost, posts } from "@/lib/posts";
import { MDXContent } from "@content-collections/mdx/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    openGraph: { type: "article", title: post.title, description: post.summary, publishedTime: post.date },
  };
}

const UPDATED = new Date().toISOString().slice(0, 10);

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!DATA.writing.enabled || !post) notFound();

  const i = posts.indexOf(post);
  const newer = posts[i - 1];
  const older = posts[i + 1];

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    url: `${SITE_URL}/blog/${slug}`,
    author: { "@type": "Person", name: DATA.name },
  }).replace(/</g, "\u003c");

  return (
    <>
      <main id="main" data-sheet={post.title} className="pt-28 sm:pt-32">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
        <div className="mx-auto max-w-[44rem] px-5 sm:px-8">
          <Link href="/blog" className="group inline-flex items-center gap-2 font-mono text-[12.5px] text-fog transition-colors hover:text-ink">
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> {DATA.writing.title}
          </Link>

          <header className="mt-8 grid gap-4 border-b border-line pb-8">
            <time dateTime={post.date} className="font-mono text-[12.5px] text-acc">
              {formatPostDate(post.date)}
            </time>
            <h1 className="font-display text-[clamp(2.4rem,6vw,4rem)] leading-[0.95] font-extrabold tracking-[-0.045em]">{post.title}</h1>
            <p className="text-[clamp(1.05rem,1.8vw,1.25rem)] leading-snug tracking-tight text-fog">{post.summary}</p>
          </header>

          <article className="prose mt-10 max-w-none text-[16.5px] leading-relaxed dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-a:text-acc prose-code:font-mono prose-code:before:content-none prose-code:after:content-none">
            <MDXContent code={post.body} components={mdxComponents} />
          </article>

          {(newer || older) && (
            <nav aria-label="More posts" className="mt-16 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
              {[
                { post: older, label: "← Older", align: "" },
                { post: newer, label: "Newer →", align: "sm:text-right sm:col-start-2" },
              ].map(({ post: p, label, align }) =>
                p ? (
                  <Link
                    key={label}
                    href={`/blog/${p.slug}`}
                    className={`group grid gap-1 rounded-2xl border border-line bg-panel px-5 py-4 transition-colors hover:border-acc ${align}`}
                  >
                    <span className="font-mono text-[11.5px] text-dim">{label}</span>
                    <span className="font-medium tracking-tight group-hover:text-acc">{p.title}</span>
                  </Link>
                ) : null
              )}
            </nav>
          )}
        </div>
      </main>
      <Footer updated={UPDATED} />
    </>
  );
}
