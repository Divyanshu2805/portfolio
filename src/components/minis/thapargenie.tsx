"use client";

import { useLoopClock } from "@/hooks/use-live";
import { passed, streamed, typed } from "@/lib/anim";
import { cn } from "@/lib/utils";
import { Tick } from "./window";
import type { MiniProps } from "./types";

/*
 * ThaparGenie: a student asks, the query is rewritten, hybrid search runs and
 * is fused, then the answer streams with numbered citations and the grounding
 * check passes. Maroon and gold on warm neutrals, like the app.
 */

const CYCLE = 12500;
const REST = 9500;
const QUESTION = "Where do I find this semester's exam dates?";
const STEPS: [string, number][] = [
  ["Rewrite as a standalone query", 2600],
  ["Hybrid search · vectors + full text", 3200],
  ["Fuse with RRF · 8 passages", 3800],
];
/** Answer text with citation markers as [n]. */
const ANSWER = "Exam dates are set in the academic calendar for the current semester [1] and any change is posted as an official notice [2].";
const SOURCES = [
  { n: 1, title: "Academic calendar", meta: "PDF · page 2" },
  { n: 2, title: "Notices", meta: "updated this week" },
];

export function ThaparGenieMini({ active, compact = false }: MiniProps) {
  const t = useLoopClock(active, CYCLE, REST);
  const sent = t >= 2000;
  const draft = sent ? "" : typed(QUESTION, t, 250, 38);
  const stepsDone = passed(STEPS.map(([, at]) => at), t);
  const answer = streamed(ANSWER, t, 4100, 85);
  const sourcesIn = t > 7200;
  const grounded = t > 7700;

  const renderAnswer = () =>
    answer.split(/(\[\d\])/).map((part, i) =>
      /^\[\d\]$/.test(part) ? (
        <span
          key={i}
          className="pop mx-0.5 inline-grid h-4 min-w-4 place-items-center rounded border border-acc/50 px-1 align-[1px] font-mono text-[9px] font-bold text-acc"
        >
          {part.slice(1, -1)}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );

  return (
    <div className={cn("flex h-full flex-col gap-2.5", compact ? "p-3" : "p-3 @lg:p-5")}>
      {!compact && (
        <div className="flex items-center justify-between">
          <span className="font-display text-[13px] font-bold tracking-tight">
            Thapar<span className="text-acc">Genie</span>
          </span>
          <span className="font-mono text-[10px] text-dim">1,300+ official documents</span>
        </div>
      )}

      {sent && (
        <p className="fade-up max-w-[88%] self-end rounded-[10px_10px_2px_10px] bg-acc/15 px-2.5 py-1.5 text-[11.5px]">{QUESTION}</p>
      )}

      {sent && !compact && (
        <ol className="grid gap-1.5" aria-label="Retrieval steps">
          {STEPS.map(([label], i) => (
            <li key={label} className={cn("flex items-center gap-2 font-mono text-[10.5px]", i < stepsDone ? "text-fog" : "text-dim")}>
              <Tick state={i < stepsDone ? "done" : i === stepsDone ? "run" : "todo"} />
              {label}
            </li>
          ))}
        </ol>
      )}

      {answer && <p className="text-[12px] leading-relaxed">{renderAnswer()}</p>}

      <div className="mt-auto grid gap-2">
        {sourcesIn && (
          <div className="flex flex-wrap gap-1.5">
            {SOURCES.map((s) => (
              <span key={s.n} className="fade-up flex items-center gap-1.5 rounded-md border border-line bg-panel-2 px-2 py-1 text-[10px]">
                <b className="font-mono text-acc">[{s.n}]</b>
                {s.title}
                {!compact && <span className="font-mono text-dim">{s.meta}</span>}
              </span>
            ))}
          </div>
        )}
        {grounded && (
          <span className="pop justify-self-start rounded-full border border-ok/40 bg-ok/10 px-2 py-0.5 font-mono text-[10px] text-ok">
            ✓ grounded · every claim cited
          </span>
        )}
        {!sent && (
          <div className="flex items-center gap-2 rounded-lg border border-line bg-panel-2 px-2.5 py-2 text-[11.5px]">
            <span className="min-w-0 flex-1 truncate">
              {draft || <span className="text-dim">Ask about fees, hostels, exams…</span>}
              <span className="caret text-acc" />
            </span>
            <span className="rounded-md bg-acc px-1.5 py-0.5 text-[10px] font-semibold text-panel">↑</span>
          </div>
        )}
      </div>
    </div>
  );
}
