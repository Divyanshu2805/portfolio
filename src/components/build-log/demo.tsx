"use client";

import type { Demo, LogLine } from "@/data/build-logs";
import { useLoopClock, useReducedMotion } from "@/hooks/use-live";
import { cn } from "@/lib/utils";
import { motion, useInView } from "motion/react";
import { RotateCcwIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Plays once when scrolled into view; `replay` restarts it. Reduced motion shows the end state. */
function usePlayback(ref: React.RefObject<Element | null>) {
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  const [run, setRun] = useState(0);
  return { playing: inView && !reduced, reduced, run, replay: () => setRun((r) => r + 1) };
}

function Frame({
  caption,
  onReplay,
  children,
  note,
}: {
  caption: string;
  onReplay?: () => void;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <figure className="m-0 overflow-hidden rounded-2xl border border-line bg-bg">
      <figcaption className="flex items-center justify-between gap-3 border-b border-line bg-panel-2 px-4 py-2.5">
        <span className="flex items-center gap-2 font-mono text-[11.5px] text-fog">
          <i className="block size-1.5 rounded-full bg-acc" aria-hidden />
          Demo · {caption}
        </span>
        {onReplay && (
          <button
            type="button"
            onClick={onReplay}
            className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-mono text-[11px] text-dim transition-colors hover:bg-panel hover:text-ink"
          >
            <RotateCcwIcon className="size-3 transition-transform duration-500 group-hover:-rotate-180" />
            Replay
          </button>
        )}
      </figcaption>
      <div className="p-4 sm:p-5">{children}</div>
      {note && <p className="border-t border-line px-4 py-2 font-mono text-[10.5px] text-dim">{note}</p>}
    </figure>
  );
}

const TONE: Record<NonNullable<LogLine["tone"]> | "none", string> = {
  ok: "text-ok",
  bad: "text-bad",
  acc: "text-acc",
  dim: "text-dim",
  none: "text-fog",
};

/** Two scenarios side by side, printing their logs line by line. */
function Compare({ demo }: { demo: Extract<Demo, { kind: "compare" }> }) {
  const ref = useRef<HTMLDivElement>(null);
  const { playing, reduced, run, replay } = usePlayback(ref);
  const total = Math.max(demo.before.lines.length, demo.after.lines.length);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!playing) return;
    let n = 0;
    const tick = () => {
      n++;
      setShown(n);
      if (n < total) timer = setTimeout(tick, 650);
    };
    let timer = setTimeout(tick, 300);
    return () => clearTimeout(timer);
  }, [playing, run, total]);

  const visible = reduced ? total : shown;
  const col = (side: "before" | "after") => {
    const s = demo[side];
    const done = visible >= s.lines.length;
    return (
      <div className={cn("grid content-start gap-2 rounded-xl border p-3.5", side === "after" ? "border-acc/40" : "border-line")}>
        <div className="flex items-center justify-between gap-2">
          <span className={cn("font-mono text-[11px] font-semibold", side === "after" ? "text-acc" : "text-dim")}>
            {side === "before" ? "✕ " : "✓ "}
            {s.label}
          </span>
          {done && side === "after" && <span className="pop font-mono text-[10px] text-ok">resolved</span>}
        </div>
        <ol className="grid min-h-[132px] content-start gap-1 font-mono text-[11.5px] leading-relaxed">
          {s.lines.map((l, i) => (
            <li
              key={`${run}-${i}`}
              className={cn(
                "flex gap-2 transition-all duration-500 ease-out-expo",
                TONE[l.tone ?? "none"],
                i < visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
              )}
            >
              <span className="select-none text-dim">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 break-words">{l.text}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  };

  return (
    <div ref={ref}>
      <Frame
        caption={demo.caption}
        onReplay={() => {
          setShown(0);
          replay();
        }}
      >
        <div className="grid gap-3 md:grid-cols-2">
          {col("before")}
          {col("after")}
        </div>
      </Frame>
    </div>
  );
}

/** Lanes of timed segments that fill left to right; widths share one scale. */
function Race({ demo }: { demo: Extract<Demo, { kind: "race" }> }) {
  const ref = useRef<HTMLDivElement>(null);
  const { playing, reduced, run, replay } = usePlayback(ref);
  const totals = demo.lanes.map((l) => l.segments.reduce((a, s) => a + s.weight, 0));
  const max = Math.max(...totals);
  const go = playing || reduced;
  const perUnit = 0.22; // seconds of animation per weight unit

  return (
    <div ref={ref}>
      <Frame caption={demo.caption} onReplay={replay} note="Bars share one time scale; lengths are illustrative.">
        <div className="grid gap-4" key={run}>
          {demo.lanes.map((lane, li) => {
            let startAt = 0;
            return (
              <div key={lane.label} className="grid gap-1.5">
                <div className="flex items-baseline justify-between font-mono text-[11.5px]">
                  <span className={li === demo.lanes.length - 1 ? "text-acc" : "text-fog"}>{lane.label}</span>
                  <span className="text-dim tabular-nums">{Math.round((totals[li] / max) * 100)}% of the slowest</span>
                </div>
                <div className="flex h-9 w-full gap-[3px] overflow-hidden rounded-lg bg-panel-2 p-[3px]">
                  {lane.segments.map((s) => {
                    const delay = startAt * perUnit;
                    startAt += s.weight;
                    return (
                      <motion.div
                        key={s.label}
                        title={s.label}
                        className={cn(
                          "flex h-full min-w-0 origin-left items-center overflow-hidden rounded-md px-2 font-mono text-[10.5px] whitespace-nowrap",
                          s.tone === "bad" && "bg-bad/20 text-bad",
                          s.tone === "ok" && "bg-ok/20 text-ok",
                          s.tone === "acc" && "bg-acc/20 text-acc",
                          !s.tone && "bg-line text-fog"
                        )}
                        style={{ width: `${(s.weight / max) * 100}%` }}
                        initial={reduced ? false : { scaleX: 0, opacity: 0.4 }}
                        animate={go ? { scaleX: 1, opacity: 1 } : undefined}
                        transition={{ duration: s.weight * perUnit, delay, ease: "linear" }}
                      >
                        <span className="truncate">{s.label}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Frame>
    </div>
  );
}

/** Two ranked lists fuse with reciprocal rank fusion; the fused list reorders into place. */
function Rank({ demo }: { demo: Extract<Demo, { kind: "rank" }> }) {
  const ref = useRef<HTMLDivElement>(null);
  const { playing, reduced, run, replay } = usePlayback(ref);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const a = setTimeout(() => setPhase(1), 700);
    const b = setTimeout(() => setPhase(2), 1900);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [playing, run]);

  const scored = useMemo(() => {
    const scores = new Map<string, number>();
    for (const list of demo.lists)
      list.items.forEach((item, i) => scores.set(item, (scores.get(item) ?? 0) + 1 / (60 + i + 1)));
    return [...scores.entries()].sort((x, y) => y[1] - x[1]);
  }, [demo]);
  const top = scored[0][1];
  const p = reduced ? 2 : phase;
  // Before fusing, show items in the first list's order; then reorder by score.
  const order = p < 2 ? [...demo.lists[0].items, ...scored.map(([i]) => i).filter((i) => !demo.lists[0].items.includes(i))] : scored.map(([i]) => i);

  return (
    <div ref={ref}>
      <Frame
        caption={demo.caption}
        onReplay={() => {
          setPhase(0);
          replay();
        }}
        note="Score = Σ 1 / (60 + rank) over each list, as in retrieve.py."
      >
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.3fr]">
          {demo.lists.map((list) => (
            <div key={list.label} className="grid content-start gap-1.5">
              <span className="font-mono text-[11px] text-dim">{list.label}</span>
              {list.items.map((item, i) => (
                <div
                  key={item}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-2 py-1.5 text-[12px] transition-colors duration-500",
                    p >= 1 && scored.findIndex(([s]) => s === item) < 2 ? "border-acc/50 text-ink" : "border-line text-fog"
                  )}
                >
                  <span className="font-mono text-[10px] text-dim">#{i + 1}</span>
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          ))}
          <div className="grid content-start gap-1.5">
            <span className="font-mono text-[11px] text-acc">Fused (RRF)</span>
            {order.map((item) => {
              const score = scored.find(([s]) => s === item)?.[1] ?? 0;
              return (
                <motion.div
                  layout={!reduced}
                  key={item}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="relative overflow-hidden rounded-md border border-line bg-panel px-2 py-1.5 text-[12px]"
                >
                  <motion.span
                    aria-hidden
                    className="absolute inset-y-0 left-0 origin-left bg-acc/15"
                    style={{ width: `${(score / top) * 100}%` }}
                    initial={false}
                    animate={{ scaleX: p >= 2 ? 1 : 0 }}
                    transition={{ duration: 0.7, ease: EASE }}
                  />
                  <span className="relative flex items-center justify-between gap-2">
                    <span className="truncate">{item}</span>
                    <span className="font-mono text-[10px] text-dim tabular-nums">{p >= 2 ? score.toFixed(4) : "…"}</span>
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Frame>
    </div>
  );
}

/** Noisy IMU signal and its moving average; the window size is yours to drag. */
function Signal({ demo }: { demo: Extract<Demo, { kind: "signal" }> }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const t = useLoopClock(inView, 20000, 4000);
  const [win, setWin] = useState(8);
  const W = 300;
  const H = 90;
  const N = 120;
  const raw = (i: number) => {
    const k = i + Math.floor(t / 50);
    const base = Math.sin(k / 18) * 0.9 + Math.sin(k / 7) * 0.25;
    const noise = (Math.sin(k * 12.9898) * 43758.5453) % 1;
    return base + noise * 0.8;
  };
  const values = Array.from({ length: N + win }, (_, i) => raw(i));
  const y = (v: number) => (H / 2 - v * 22).toFixed(1);
  const rawPts = values.slice(win).map((v, i) => `${((i / N) * W).toFixed(1)},${y(v)}`).join(" ");
  const avgPts = values
    .slice(win)
    .map((_, i) => {
      const slice = values.slice(i + 1, i + win + 1);
      return `${((i / N) * W).toFixed(1)},${y(slice.reduce((a, b) => a + b, 0) / slice.length)}`;
    })
    .join(" ");

  return (
    <div ref={ref}>
      <Frame caption={demo.caption}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-36 w-full" role="img" aria-label="Noisy signal and its moving average">
          <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="var(--line)" />
          <polyline points={rawPts} fill="none" stroke="var(--dim)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <polyline points={avgPts} fill="none" stroke="var(--acc)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
        <label className="mt-3 flex items-center gap-3 font-mono text-[11.5px] text-fog">
          <span className="whitespace-nowrap">window {win} samples</span>
          <input
            type="range"
            min={1}
            max={24}
            value={win}
            onChange={(e) => setWin(Number(e.target.value))}
            className="w-full accent-[var(--acc)]"
            aria-label="Moving average window"
          />
        </label>
      </Frame>
    </div>
  );
}

export function DemoView({ demo }: { demo: Demo }) {
  switch (demo.kind) {
    case "compare":
      return <Compare demo={demo} />;
    case "race":
      return <Race demo={demo} />;
    case "rank":
      return <Rank demo={demo} />;
    case "signal":
      return <Signal demo={demo} />;
  }
}
