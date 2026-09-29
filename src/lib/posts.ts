import { allPosts } from "content-collections";

export type Post = (typeof allPosts)[number];

/** Newest first. */
export const posts: Post[] = [...allPosts].sort((a, b) => b.date.localeCompare(a.date));

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

/** "2026-07-03" → "3 Jul 2026", fixed to UTC so server and client agree. */
export const formatPostDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
