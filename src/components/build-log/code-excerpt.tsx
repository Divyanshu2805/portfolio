import { codeToHtml } from "shiki";
import { CopyCode } from "./copy-code";

/** A real excerpt from the project's repo, highlighted at build time for both themes. */
export async function CodeExcerpt({ file, lang, snippet }: { file: string; lang: string; snippet: string }) {
  const html = await codeToHtml(snippet, {
    lang,
    themes: { light: "github-light", dark: "github-dark-dimmed" },
    defaultColor: false,
  });
  return (
    <figure className="code-excerpt m-0 overflow-hidden rounded-2xl border border-line bg-panel">
      <figcaption className="flex items-center justify-between gap-3 border-b border-line bg-panel-2 px-4 py-2">
        <span className="flex min-w-0 items-center gap-2 font-mono text-[11.5px] text-fog">
          <span className="rounded border border-line px-1.5 text-[10px] text-dim uppercase">{lang}</span>
          <span className="truncate">{file}</span>
        </span>
        <CopyCode text={snippet} />
      </figcaption>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}
