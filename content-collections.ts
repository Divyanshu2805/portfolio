import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import remarkGfm from "remark-gfm";
import { z } from "zod";

/** Blog posts: one .mdx file per post in /content; the file name is the slug. */
const posts = defineCollection({
  name: "posts",
  directory: "content",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
    date: z.string(),
    summary: z.string(),
    content: z.string(),
  }),
  transform: async (post, context) => ({
    ...post,
    slug: post._meta.path,
    body: await compileMDX(context, post, { remarkPlugins: [remarkGfm] }),
  }),
});

export default defineConfig({ collections: [posts] });
