"use client";

import { useLoopClock } from "@/hooks/use-live";
import type { MiniProps } from "./types";

/*
 * TeleMetrix: the track-side view. A G-G friction circle with a fading trail,
 * rolling speed and throttle traces on a sliding window, and live readouts
 * counting validated frames. The signal is synthetic, like the bench simulator.
 */

const CYCLE = 16000;
const REST = 5200;
const TAU = Math.PI * 2;

/** A lap-like lateral/longitudinal g pattern. */
function g(ms: number) {
  const p = (ms / CYCLE) * TAU;
  return {
    lat: Math.sin(p * 3) * 1.15 + Math.sin(p * 7) * 0.12,
    lon: Math.cos(p * 3) * 0.8 * Math.sin(p * 2 + 0.6) - 0.05,
  };
}
function speed(ms: number) {
  const p = (ms / CYCLE) * TAU;
  return 62 + Math.cos(p * 6) * 26 + Math.sin(p * 13) * 3;
}
function throttle(ms: number) {
  const p = (ms / CYCLE) * TAU;
  return Math.max(0, Math.min(100, 60 + Math.cos(p * 6 - 0.4) * 55));
}

const R = 46;
/** g to SVG units, rounded so server and browser maths agree. */
const px = (value: number) => ((value / 1.5) * R).toFixed(2);
const WINDOW = 3200;
const W = 150;
const H = 34;

function trace(fn: (ms: number) => number, t: number, lo: number, hi: number) {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const ms = (t - WINDOW + (i / 40) * WINDOW + CYCLE) % CYCLE;
    const y = H - ((fn(ms) - lo) / (hi - lo)) * H;
    pts.push(`${((i / 40) * W).toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

export function TeleMetrixMini({ active }: MiniProps) {
  const t = useLoopClock(active, CYCLE, REST, REST);
  const now = g(t);
  const trail = Array.from({ length: 14 }, (_, i) => g((t - i * 70 + CYCLE) % CYCLE));
  const frames = Math.floor(t / 33) + 12480;

  return (
    <div className="grid h-full grid-cols-[auto_1fr] items-center gap-3 p-3">
      <svg viewBox="-60 -60 120 120" className="size-[112px]" role="img" aria-label="G-G friction circle">
        {[1, 0.66, 0.33].map((k) => (
          <circle key={k} r={R * k} fill="none" stroke="var(--line)" strokeWidth={1} />
        ))}
        <line x1={-R} x2={R} y1={0} y2={0} stroke="var(--line)" />
        <line y1={-R} y2={R} x1={0} x2={0} stroke="var(--line)" />
        {trail.map((p, i) => (
          <circle key={i} cx={px(p.lat)} cy={px(-p.lon)} r={(2.2 - i * 0.12).toFixed(2)} fill="var(--acc)" opacity={(1 - i / 14).toFixed(2)} />
        ))}
        <circle cx={px(now.lat)} cy={px(-now.lon)} r={3.6} fill="var(--acc)" />
        <text x={-R} y={57} fontSize={8} fill="var(--dim)" fontFamily="var(--font-jetbrains)">
          1.5 g
        </text>
      </svg>
      <div className="grid min-w-0 gap-2">
        <div className="grid grid-cols-3 gap-1 font-mono">
          {[
            ["km/h", speed(t).toFixed(0)],
            ["lat g", Math.abs(now.lat).toFixed(2)],
            ["thr %", throttle(t).toFixed(0)],
          ].map(([label, value]) => (
            <div key={label} className="grid">
              <b className="text-[14px] tabular-nums leading-none">{value}</b>
              <span className="text-[9px] text-dim">{label}</span>
            </div>
          ))}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-7 w-full" aria-hidden>
          <polyline points={trace(speed, t, 30, 95)} fill="none" stroke="var(--acc)" strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
        </svg>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-5 w-full" aria-hidden>
          <polyline points={trace(throttle, t, -5, 105)} fill="none" stroke="var(--fog)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="truncate font-mono text-[9.5px] text-dim">
          230,400 baud · {frames.toLocaleString("en-US")} frames · 0 dropped
        </span>
      </div>
    </div>
  );
}
