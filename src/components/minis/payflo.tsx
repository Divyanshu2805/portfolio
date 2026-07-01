"use client";

import { useLoopClock } from "@/hooks/use-live";
import { passed } from "@/lib/anim";
import { cn } from "@/lib/utils";
import type { MiniProps } from "./types";

/*
 * PayFlo: a payment walks its state machine; capture times out, the client
 * retries with the same idempotency key, the gateway replays the result
 * instead of charging twice, and the outbox publishes to Kafka.
 */

const CYCLE = 10500;
const REST = 7600;
const STATES = ["CREATED", "AUTHORIZED", "CAPTURED", "SETTLED"];
const STATE_AT = [900, 1600, 3900, 6600];
const LOG: { at: number; text: string; tone?: "bad" | "ok" | "acc" }[] = [
  { at: 300, text: "POST /payments  Idempotency-Key: 7f3a…" },
  { at: 1600, text: "authorize → bank  200" },
  { at: 2300, text: "capture → bank  timeout", tone: "bad" },
  { at: 3100, text: "retry  same key 7f3a…" },
  { at: 3900, text: "replayed result · no second charge", tone: "ok" },
  { at: 4700, text: "outbox → kafka  payment.captured", tone: "acc" },
  { at: 5500, text: "webhook  HMAC-signed → 200", tone: "acc" },
];

export function PayFloMini({ active }: MiniProps) {
  const t = useLoopClock(active, CYCLE, REST);
  const state = passed(STATE_AT, t);
  const lines = LOG.filter((l) => t >= l.at).slice(-5);
  const charges = t >= 3900 ? 1 : 0;

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="flex items-center gap-1">
        {STATES.map((s, i) => (
          <div key={s} className="flex min-w-0 flex-1 items-center gap-1">
            <span
              className={cn(
                "min-w-0 flex-1 truncate rounded-md border px-1 py-1 text-center font-mono text-[8.5px] font-semibold transition-all duration-500",
                i < state ? "border-acc/40 text-acc" : "border-line text-dim",
                i === state - 1 && "bg-acc/15"
              )}
            >
              {s}
            </span>
            {i < STATES.length - 1 && <span className={cn("text-[9px]", i < state - 1 ? "text-acc" : "text-line")}>→</span>}
          </div>
        ))}
      </div>
      <ol className="grid flex-1 content-start gap-1 font-mono text-[10.5px]">
        {lines.map((l) => (
          <li
            key={l.at}
            className={cn(
              "fade-up truncate",
              l.tone === "bad" && "text-bad",
              l.tone === "ok" && "text-ok",
              l.tone === "acc" && "text-acc",
              !l.tone && "text-fog"
            )}
          >
            {l.text}
          </li>
        ))}
      </ol>
      <div className="flex items-center justify-between border-t border-line pt-2 font-mono text-[10px]">
        <span className="text-dim">customer charged</span>
        <span className="font-semibold tabular-nums">{charges}×</span>
      </div>
    </div>
  );
}
