"use client";

import { useLoopClock } from "@/hooks/use-live";
import { hash } from "@/lib/anim";
import { cn } from "@/lib/utils";
import type { MiniProps } from "./types";

/*
 * DAQ: raw CAN frames scroll past at 1 Mbps while the driver dashboard decodes
 * them into RPM, gear and brake pressure, with the FastLED shift light filling
 * as revs climb. Values are synthetic.
 */

const CYCLE = 9000;
const REST = 6300;
const IDS = ["0CFFF048", "0CFFF148", "0CFFF548", "0CFFF248", "0CFFF348"];
const LEDS = 10;

function rpm(ms: number) {
  // Sawtooth through the gears: climb, shift, drop.
  const phase = (ms % 1800) / 1800;
  return Math.round(4200 + phase * phase * 7400);
}

export function DaqMini({ active }: MiniProps) {
  const t = useLoopClock(active, CYCLE, REST, REST);
  const frame = Math.floor(t / 140);
  const revs = rpm(t);
  const gear = 1 + (Math.floor(t / 1800) % 5);
  const lit = Math.round(((revs - 4200) / 7400) * LEDS);
  const brake = Math.round(hash(Math.floor(t / 900)) * 38);
  const rows = Array.from({ length: 6 }, (_, i) => frame - 5 + i);

  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-2 p-3">
      <div className="flex items-center gap-3">
        <div className="flex gap-[3px]" role="img" aria-label={`Shift light, ${lit} of ${LEDS} lit`}>
          {Array.from({ length: LEDS }, (_, i) => (
            <i
              key={i}
              className={cn("block h-2.5 w-2 rounded-[2px] transition-opacity duration-100", i < lit ? "opacity-100" : "opacity-15")}
              style={{ background: i < 5 ? "var(--ok)" : i < 8 ? "#eab308" : "var(--acc)" }}
            />
          ))}
        </div>
        <div className="ml-auto flex gap-3 font-mono">
          <span className="grid text-right">
            <b className="text-[14px] leading-none tabular-nums">{revs.toLocaleString("en-US")}</b>
            <span className="text-[9px] text-dim">rpm</span>
          </span>
          <span className="grid text-right">
            <b className="text-[14px] leading-none text-acc">{gear}</b>
            <span className="text-[9px] text-dim">gear</span>
          </span>
          <span className="grid text-right">
            <b className="text-[14px] leading-none tabular-nums">{brake}</b>
            <span className="text-[9px] text-dim">bar</span>
          </span>
        </div>
      </div>
      <ol className="grid content-end gap-0.5 overflow-hidden font-mono text-[10px]" aria-label="CAN frames">
        {rows.map((n, i) => {
          const bytes = Array.from({ length: 8 }, (_, b) =>
            Math.floor(hash(n * 8 + b) * 256)
              .toString(16)
              .padStart(2, "0")
              .toUpperCase()
          );
          return (
            <li key={n} className={cn("flex gap-2 whitespace-nowrap", i === rows.length - 1 ? "text-ink" : "text-dim")}>
              <span className="text-acc">{IDS[((n % IDS.length) + IDS.length) % IDS.length]}</span>
              <span>8</span>
              <span className="truncate">{bytes.join(" ")}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
