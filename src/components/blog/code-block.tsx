"use client";

import { CopyCode } from "@/components/build-log/copy-code";
import { type ReactElement, isValidElement, useEffect, useState } from "react";

type CodeChild = ReactElement<{ className?: string; children?: string }>;

/**
 * A fenced code block from MDX: same frame as the build-log excerpts, highlighted
 * in the browser (posts are compiled ahead of time, so Shiki can't run there).
 */
export function CodeBlock({ children }: { children?: React.ReactNode }) {
  const code = isValidElement(children) ? (children as CodeChild) : null;
  const lang = code?.props.className?.replace("language-", "") ?? "text";
  const text = (code?.props.children ?? "").replace(/\n$/, "");
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    import("shiki/bundle/web")
      .then(({ codeToHtml }) =>
        codeToHtml(text, { lang, themes: { light: "github-light", dark: "github-dark-dimmed" }, defaultColor: false })
      )
      .then((out) => live && setHtml(out))
      .catch(() => {
        /* unknown language: keep the plain text */
      });
    return () => {
      live = false;
    };
  }, [text, lang]);

  return (
    <figure className="code-excerpt not-prose my-8 overflow-hidden rounded-2xl border border-line bg-panel">
      <figcaption className="flex items-center justify-between gap-3 border-b border-line bg-panel-2 px-4 py-2">
        <span className="rounded border border-line px-1.5 font-mono text-[10px] text-dim uppercase">{lang}</span>
        <CopyCode text={text} />
      </figcaption>
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre>
          <code>{text}</code>
        </pre>
      )}
    </figure>
  );
}
