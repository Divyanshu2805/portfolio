import { allPosts } from "content-collections";
import Link from "next/link";
import type { Metadata } from "next";
import { paginate, normalizePage } from "@/lib/pagination";
import { notFound } from "next/navigation";
import { DATA } from "@/data/resume";

export const metadata: Metadata = {
  title: DATA.writing.title,
  description: DATA.writing.description,
  openGraph: {
    title: DATA.writing.title,
    description: DATA.writing.description,
  },
  twitter: {
    card: "summary_large_image",
    title: DATA.writing.title,
    description: DATA.writing.description,
  },
};

const PAGE_SIZE = 5;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (!DATA.writing.enabled) notFound();

  const { page: pageParam } = await searchParams;

  const posts = allPosts;
  const sortedPosts = [...posts].sort((a, b) => {
    if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
      return -1;
    }
    return 1;
  });

  const totalPages = Math.ceil(sortedPosts.length / PAGE_SIZE);
  const currentPage = normalizePage(pageParam, totalPages);
  const { items: paginatedPosts, pagination } = paginate(sortedPosts, {
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  return (
    <section id="blog">
        <h1 className="text-h2 mb-2">{DATA.writing.title}</h1>
        <p className="text-small text-graphite mb-8">{DATA.writing.description}</p>
      
      {paginatedPosts.length > 0 ? (
        <>
            <div className="flex flex-col gap-5">
              {paginatedPosts.map((post) => {
                const slug = post._meta.path.replace(/\.mdx$/, "");
                return (
                    <Link
                      key={slug}
                      className="flex items-start gap-x-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      href={`/blog/${slug}`}
                    >
                      <div className="flex flex-col gap-y-2 flex-1">
                        <p className="tracking-tight text-lg font-medium">
                          <span className="group-hover:text-foreground">
                            {post.title}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {post.publishedAt}
                        </p>
                      </div>
                    </Link>
                );
              })}
            </div>
          
          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
              <div className="flex gap-3 flex-row items-center justify-between mt-8">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2 sm:justify-end">
                  {pagination.hasPreviousPage ? (
                    <Link
                      href={`/blog?page=${pagination.page - 1}`}
                      className="h-8 w-fit px-2 flex items-center justify-center text-sm border border-border rounded-lg hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span className="h-8 w-fit px-2 flex items-center justify-center text-sm border border-border rounded-lg opacity-50 cursor-not-allowed">
                      Previous
                    </span>
                  )}
                  {pagination.hasNextPage ? (
                    <Link
                      href={`/blog?page=${pagination.page + 1}`}
                      className="h-8 w-fit px-2 flex items-center justify-center text-sm border border-border rounded-lg hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="h-8 w-fit px-2 flex items-center justify-center text-sm border border-border rounded-lg opacity-50 cursor-not-allowed">
                      Next
                    </span>
                  )}
                </div>
              </div>
                      )}
        </>
      ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-border rounded-xl">
            <p className="text-muted-foreground text-center">
              No posts yet.
            </p>
          </div>
              )}
    </section>
  );
}
