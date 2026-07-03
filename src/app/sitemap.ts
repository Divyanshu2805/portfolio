import { BUILD_LOGS } from "@/data/build-logs";
import { DATA } from "@/data/resume";
import { SITE_URL } from "@/lib/site";
import { allPosts } from "content-collections";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [{ url: SITE_URL, changeFrequency: "weekly", priority: 1 }];

  for (const log of BUILD_LOGS) {
    pages.push({ url: `${SITE_URL}/projects/${log.slug}`, changeFrequency: "monthly" });
  }

  if (DATA.writing.enabled) {
    pages.push({ url: `${SITE_URL}/blog`, changeFrequency: "weekly" });
    for (const post of allPosts) {
      pages.push({
        url: `${SITE_URL}/blog/${post._meta.path.replace(/\.mdx$/, "")}`,
        lastModified: post.updatedAt ?? post.publishedAt,
      });
    }
  }

  return pages;
}
