import { Footer } from "@/components/sections/footer";
import { Reveal } from "@/components/site/motion-text";
import { DATA } from "@/data/resume";
import { formatPostDate, posts } from "@/lib/posts";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: DATA.writing.title,
  description: DATA.writing.description,
};

const UPDATED = new Date().toISOString().slice(0, 10);

export default function BlogIndex() {
  if (!DATA.writing.enabled) notFound();

  return (
    <>
      <main id="main" data-sheet={DATA.writing.title} className="pt-28 sm:pt-32">
        <div className="mx-auto max-w-page px-5 sm:px-8">
          <header className="grid gap-4">
            <span className="font-mono text-[12.5px] text-acc">/blog</span>
            <h1 className="font-display text-[clamp(3rem,9vw,6rem)] leading-[0.9] font-extrabold tracking-[-0.055em]">
              {DATA.writing.title}
            </h1>
            <p className="max-w-[52ch] text-[clamp(1.1rem,2vw,1.35rem)] leading-snug tracking-tight text-fog">
              {DATA.writing.description}
            </p>
          </header>

          {posts.length === 0 ? (
            <p className="mt-14 rounded-2xl border border-dashed border-line px-6 py-10 text-center font-mono text-[13px] text-dim">
              Nothing published yet.
            </p>
          ) : (
            <ol className="mt-14 grid border-t border-line">
              {posts.map((post, i) => (
                <Reveal as="li" key={post.slug} delay={Math.min(i, 6) * 0.05}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group grid gap-2 border-b border-line py-6 sm:grid-cols-[9rem_1fr] sm:gap-8"
                  >
                    <time dateTime={post.date} className="pt-1 font-mono text-[12.5px] text-dim">
                      {formatPostDate(post.date)}
                    </time>
                    <span className="grid gap-1.5">
                      <span className="font-display text-[clamp(1.35rem,2.6vw,1.8rem)] leading-tight font-bold tracking-[-0.03em] transition-colors group-hover:text-acc">
                        {post.title}
                      </span>
                      <span className="max-w-[64ch] text-[15.5px] leading-relaxed text-fog">{post.summary}</span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ol>
          )}
        </div>
      </main>
      <Footer updated={UPDATED} />
    </>
  );
}
