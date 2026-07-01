"use client";

import { useLoopClock } from "@/hooks/use-live";
import { passed, streamed, typed } from "@/lib/anim";
import { cn } from "@/lib/utils";
import { Tick } from "./window";
import type { MiniProps } from "./types";

/*
 * VibeCraft: a one-line idea becomes a spec through two questions, the build
 * checklist ticks while files stream in, a preview pod is claimed from the warm
 * pool, and the running app appears. Warm-ink panels and copper, like the app.
 */

const CYCLE = 12000;
const REST = 9000;
const IDEA = "A habit tracker with streaks";
const TASKS = ["Clarify the idea", "Write the spec", "Generate files", "Claim a preview pod", "Publish revision"];
const DONE_AT = [2900, 3500, 6000, 6800, 7400];
const FILES = ["package.json", "src/App.tsx", "src/Habit.tsx", "src/streak.ts", "src/index.css"];
const CODE = [
  ["kw", "export function "],
  ["fn", "streak"],
  ["", "(days: "],
  ["ty", "boolean"],
  ["", "[]) {\n  "],
  ["kw", "let "],
  ["", "n = "],
  ["num", "0"],
  ["", ";\n  "],
  ["kw", "for "],
  ["", "(const d of days.toReversed()) {\n    "],
  ["kw", "if "],
  ["", "(!d) "],
  ["kw", "break"],
  ["", ";\n    n++;\n  }\n  "],
  ["kw", "return "],
  ["", "n;\n}"],
] as const;
const CODE_TEXT = CODE.map(([, s]) => s).join("");
/** Where each code token starts in CODE_TEXT. */
const CODE_OFFSETS = CODE.reduce<number[]>((acc, [, s], i) => [...acc, i === 0 ? 0 : acc[i - 1] + CODE[i - 1][1].length], []);
const HABITS = ["Read 20 pages", "Run", "Ship one PR"];
/** Habits done per day, as a share of all habits (for the preview's bar chart). */
const WEEK = [66, 100, 100, 66, 100, 100, 100];

export function VibeCraftMini({ active, compact = false }: MiniProps) {
  const t = useLoopClock(active, CYCLE, REST);
  const done = passed(DONE_AT, t);
  const ideaText = typed(IDEA, t, 200, 40);
  const files = passed(FILES.map((_, i) => 3700 + i * 420), t);
  const codeChars = t < 3900 ? 0 : Math.min(CODE_TEXT.length, Math.floor((t - 3900) / 16));
  const previewState = t < 6000 ? "wait" : t < 6800 ? "claim" : "live";
  const filled = Math.min(7, Math.max(0, Math.floor((t - 7000) / 180)));

  const checklist = (
    <ol className="grid content-start gap-2" aria-label="Build checklist">
      {TASKS.map((task, i) => {
        const state = i < done ? "done" : i === done && t > 2400 ? "run" : "todo";
        return (
          <li key={task} className={cn("flex items-center gap-2 text-[11.5px] transition-colors", state === "done" ? "text-ink" : "text-dim")}>
            <Tick state={state} />
            <span className="truncate">{task}</span>
          </li>
        );
      })}
    </ol>
  );

  const preview = (
    <div
      className={cn(
        "relative flex min-h-[120px] flex-1 flex-col overflow-hidden rounded-lg border transition-colors duration-500",
        previewState === "live" ? "border-acc/50 bg-bg" : "border-dashed border-line"
      )}
    >
      {previewState !== "live" ? (
        <div className="grid flex-1 place-items-center p-3 text-center font-mono text-[10.5px] text-dim">
          {previewState === "wait" ? (
            "preview starts after the build"
          ) : (
            <span className="flex items-center gap-2">
              <Tick state="run" /> claiming a warm pod…
            </span>
          )}
          {previewState === "claim" && <span aria-hidden className="shimmer absolute inset-0" />}
        </div>
      ) : (
        <div className="pop grid gap-2 p-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-[13px] font-bold tracking-tight">Habits</span>
            <span className="rounded-full bg-acc/15 px-2 py-0.5 font-mono text-[9.5px] font-semibold text-acc">
              {compact ? `${filled}d` : `${filled}-day streak`}
            </span>
          </div>
          {HABITS.map((h, r) => (
            <div key={h} className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-[10.5px] text-fog">{h}</span>
              <span className="flex flex-none gap-[3px]">
                {Array.from({ length: compact ? 5 : 7 }, (_, d) => (
                  <i
                    key={d}
                    className={cn(
                      "block size-2 rounded-[2px] transition-colors duration-300 @[420px]:size-2.5",
                      d < filled - (compact ? 2 : 0) - (r === 1 ? 2 : 0) ? "bg-acc" : "bg-line"
                    )}
                  />
                ))}
              </span>
            </div>
          ))}
          {!compact && (
            <div className="mt-2 grid gap-1.5 border-t border-line pt-2.5">
              <span className="font-mono text-[9.5px] text-dim">this week</span>
              <div className="flex h-12 items-end gap-1.5">
                {WEEK.map((v, d) => (
                  <i
                    key={d}
                    className="block flex-1 origin-bottom rounded-t-[3px] bg-acc/70 transition-transform duration-500"
                    style={{ height: `${v}%`, transform: `scaleY(${d < filled ? 1 : 0.08})` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (compact) {
    return (
      <div className="grid h-full grid-cols-[1fr_1.1fr] gap-3 p-3">
        <div className="grid content-start gap-3">
          <p className="truncate rounded-md border border-line bg-panel-2 px-2 py-1 font-mono text-[10.5px]">
            {ideaText || " "}
            {t < 1600 && <span className="caret text-acc" />}
          </p>
          {checklist}
        </div>
        {preview}
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-[1fr_1.1fr] gap-3 p-3 @lg:grid-cols-[1fr_1.2fr_1fr] @lg:p-4">
      {/* Chat */}
      <div className="flex min-w-0 flex-col gap-2">
        <p className="truncate rounded-[10px_10px_2px_10px] bg-acc/15 px-2.5 py-1.5 text-[11.5px] @lg:self-end @lg:whitespace-normal">
          {ideaText || " "}
          {t < 1600 && <span className="caret text-acc" />}
        </p>
        {t > 1500 && (
          <div className="fade-up hidden gap-1.5 rounded-[10px_10px_10px_2px] @lg:grid border border-line bg-panel-2 px-2.5 py-2 text-[11px] text-fog">
            <span>Two quick questions first.</span>
            <span className="flex flex-wrap gap-1">
              {t > 1900 && <span className="pop rounded-full border border-acc/40 px-2 py-0.5 text-[10px] text-ink">Web app</span>}
              {t > 2300 && <span className="pop rounded-full border border-acc/40 px-2 py-0.5 text-[10px] text-ink">Daily reminders</span>}
            </span>
          </div>
        )}
        <div className="mt-1">{checklist}</div>
      </div>

      {/* Files and code */}
      <div className="hidden min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-bg @lg:flex">
        <div className="flex flex-wrap gap-1 border-b border-line p-2">
          {FILES.map((f, i) => (
            <span
              key={f}
              className={cn(
                "rounded px-1.5 py-0.5 font-mono text-[9.5px] transition-all duration-300",
                i < files ? "text-fog opacity-100" : "opacity-0",
                i === files - 1 && t < 6000 && "bg-acc/15 text-acc"
              )}
            >
              {f}
            </span>
          ))}
        </div>
        <pre className="m-0 flex-1 overflow-hidden whitespace-pre-wrap p-2.5 font-mono text-[10.5px] leading-[1.55]">
          {CODE.map(([kind, s], i) => {
            const part = s.slice(0, Math.max(0, codeChars - CODE_OFFSETS[i]));
            if (!part) return null;
            return (
              <span
                key={i}
                className={cn(
                  kind === "kw" && "text-acc",
                  kind === "fn" && "text-[var(--c-ion)]",
                  kind === "ty" && "text-[var(--c-payflo)]",
                  kind === "num" && "text-[var(--c-genie)]"
                )}
              >
                {part}
              </span>
            );
          })}
          {codeChars > 0 && codeChars < CODE_TEXT.length && <span className="caret text-acc" />}
        </pre>
      </div>

      {/* Preview */}
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-center justify-between font-mono text-[10px] text-dim">
          <span>preview</span>
          {t > 7400 && <span className="pop text-ok">rev 3 published</span>}
        </div>
        {preview}
        <p className="font-mono text-[10px] text-dim">{streamed("served through a signed, expiring link", t, 7600, 90)}</p>
      </div>
    </div>
  );
}
