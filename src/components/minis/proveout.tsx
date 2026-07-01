"use client";

import { useLoopClock } from "@/hooks/use-live";
import { cn } from "@/lib/utils";
import { Tick } from "./window";
import type { MiniProps } from "./types";

/*
 * Proveout: an agent-written pull request runs its independent checks one by
 * one, and the merge gate opens only when every check has passed.
 */

const CYCLE = 10000;
const REST = 7200;
// SAMPLE: replace with Proveout's real check names
const CHECKS: { name: string; detail: string }[] = [
  { name: "Reproduce the issue", detail: "fails on main, passes on branch" },
  { name: "Tests and types", detail: "412 passed" },
  { name: "Behaviour diff", detail: "2 changes, both in scope" },
  { name: "Security scan", detail: "no new findings" },
];
const START = 900;
const STEP = 1200;

export function ProveoutMini({ active, compact = false }: MiniProps) {
  const t = useLoopClock(active, CYCLE, REST);
  const gateOpen = t >= START + CHECKS.length * STEP + 300;

  return (
    <div className={cn("flex h-full flex-col gap-2", compact ? "p-3" : "p-4")}>
      <div className="grid gap-0.5">
        <span className="truncate text-[12px] font-semibold">
          <span className="font-mono text-dim">#412</span> Retry failed webhook deliveries
        </span>
        <span className="font-mono text-[10px] text-dim">opened by an agent · 14 files · +318 −42</span>
      </div>
      <ol className="grid gap-0">
        {CHECKS.map((c, i) => {
          const start = START + i * STEP;
          const state = t < start ? "todo" : t < start + STEP * 0.7 ? "run" : "done";
          return (
            <li key={c.name} className="flex items-center gap-2 border-b border-line py-1.5 text-[11.5px] last:border-b-0">
              <Tick state={state} />
              <span className={cn("min-w-0 flex-1 truncate", state === "todo" ? "text-dim" : "text-ink")}>{c.name}</span>
              <span className={cn("truncate font-mono text-[10px]", state === "done" ? "text-fog" : "text-dim")}>
                {state === "done" ? c.detail : state === "run" ? "running…" : "queued"}
              </span>
            </li>
          );
        })}
      </ol>
      <div
        className={cn(
          "mt-auto flex items-center justify-between rounded-lg border px-3 py-2 font-mono text-[11.5px] font-bold transition-all duration-500",
          gateOpen ? "border-ok/50 bg-ok/10 text-ok" : "border-line text-dim"
        )}
      >
        <span>merge gate</span>
        <span className={cn(gateOpen && "pop")}>{gateOpen ? "✓ proven, ready to merge" : "waiting for proof"}</span>
      </div>
    </div>
  );
}
