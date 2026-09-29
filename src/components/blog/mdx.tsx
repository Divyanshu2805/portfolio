/* eslint-disable @next/next/no-img-element -- post images are plain files in /public */
import { CodeBlock } from "@/components/blog/code-block";
import Link from "next/link";
import type { ComponentProps } from "react";

/** An image or video with an optional caption, for use inside posts. */
function Figure({ src, alt = "", caption, video }: { src: string; alt?: string; caption?: string; video?: boolean }) {
  return (
    <figure className="not-prose my-8 grid gap-2">
      <div className="overflow-hidden rounded-2xl border border-line bg-panel">
        {video ? (
          <video src={src} controls playsInline className="block w-full" />
        ) : (
          <img src={src} alt={alt} className="block w-full" loading="lazy" />
        )}
      </div>
      {caption && <figcaption className="font-mono text-[12px] text-dim">{caption}</figcaption>}
    </figure>
  );
}

/** How MDX elements render inside a post. */
export const mdxComponents = {
  Figure,
  pre: CodeBlock,
  a: ({ href = "", ...props }: ComponentProps<"a">) =>
    href.startsWith("/") || href.startsWith("#") ? (
      <Link href={href} {...props} />
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
    ),
  table: (props: ComponentProps<"table">) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
};
