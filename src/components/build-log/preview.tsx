"use client";

import { ButtonLink } from "@/components/site/button";
import { Reveal } from "@/components/site/motion-text";
import { getBuildLog } from "@/data/build-logs";
import Link from "next/link";

const firstSentence = (text: string) => {
  const match = text.match(/^.*?[.!?](\s|$)/);
  return (match ? match[0] : text).trim();
};

/**
 * "From the build log": the problems I hit on this project as rows. Pointing at
 * a row (or reading on a phone) shows the problem and the fix in one line each;
 * every row links to that entry in the full build log.
 */
export function BuildLogPreview({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const log = getBuildLog(slug);
  if (!log) return null;
  const steps = compact ? log.steps.slice(0, 2) : log.steps;

  return (
    <Reveal className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <span className="inline-flex items-center gap-2 font-mono text-[12px] tracking-wide text-fog">
          <i aria-hidden className="block size-1.5 rounded-full bg-acc" />
          From the build log · problems I hit and how I solved them
        </span>
      </div>
      <ol className="grid overflow-hidden rounded-2xl border border-line bg-panel">
        {steps.map((step, i) => (
          <li key={step.id} className="border-b border-line last:border-b-0">
            <Link
              href={`/projects/${slug}#${step.id}`}
              className="group grid grid-cols-[2.25rem_1fr_auto] items-start gap-x-3 px-4 py-3.5 transition-colors duration-300 hover:bg-acc/[0.06] focus-visible:bg-acc/[0.06] sm:px-5"
            >
              <span className="pt-0.5 font-mono text-[12px] text-dim transition-colors group-hover:text-acc">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="grid min-w-0">
                <span className="text-[15.5px] font-semibold tracking-tight">{step.title}</span>
                <span className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out-expo can-hover:grid-rows-[0fr] can-hover:group-hover:grid-rows-[1fr] can-hover:group-focus-visible:grid-rows-[1fr]">
                  <span className="min-h-0 overflow-hidden">
                    <span className="mt-2 grid gap-1 text-[13.5px] leading-snug">
                      <span className="text-fog">
                        <b className="font-mono text-[11px] font-medium text-bad">problem </b>
                        {firstSentence(step.problem)}
                      </span>
                      <span className="text-fog">
                        <b className="font-mono text-[11px] font-medium text-acc">fix </b>
                        {firstSentence(step.solution)}
                      </span>
                    </span>
                  </span>
                </span>
              </span>
              <span
                aria-hidden
                className="pt-0.5 text-acc opacity-60 transition-[transform,opacity] duration-300 group-hover:translate-x-1 group-hover:opacity-100"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <div>
        <ButtonLink href={`/projects/${slug}`} variant="ghost" size="sm">
          Read the full build log
        </ButtonLink>
      </div>
    </Reveal>
  );
}
