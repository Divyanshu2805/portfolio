"use client";

import type { Architecture } from "@/data/build-logs";
import { useReducedMotion } from "@/hooks/use-live";
import { cn } from "@/lib/utils";
import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";

const W = 100;
const H = 84;

/**
 * System diagram: connections draw themselves in when it scrolls into view,
 * then requests pulse along them. Pointing at a component highlights what it
 * talks to. Nodes are HTML over an SVG so labels stay crisp.
 */
export function ArchitectureDiagram({ arch, label }: { arch: Architecture; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();
  const [focus, setFocus] = useState<string | null>(null);
  const byId = new Map(arch.nodes.map((n) => [n.id, n]));
  const linked = (id: string) => arch.edges.some((e) => (e.from === focus && e.to === id) || (e.to === focus && e.from === id));

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-bg" data-lenis-prevent-wheel>
      <div ref={ref} className="relative min-w-[640px]" style={{ aspectRatio: `${W} / ${H}` }} role="img" aria-label={label}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" preserveAspectRatio="none" aria-hidden>
          <defs>
            <pattern id="arch-grid" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="0.2" cy="0.2" r="0.12" fill="var(--line)" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#arch-grid)" />
          {arch.edges.map((e, i) => {
            const a = byId.get(e.from)!;
            const b = byId.get(e.to)!;
            const midX = (a.x + b.x) / 2;
            // Orthogonal routing: out horizontally, across, then in.
            const d = `M${a.x} ${a.y} H${midX} V${b.y} H${b.x}`;
            const hot = focus !== null && (e.from === focus || e.to === focus);
            return (
              <g key={i}>
                <motion.path
                  id={`edge-${i}`}
                  d={d}
                  fill="none"
                  stroke={hot ? "var(--acc)" : "var(--dim)"}
                  strokeWidth={hot ? 0.26 : 0.15}
                  strokeLinejoin="round"
                  initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                  animate={inView || reduced ? { pathLength: 1, opacity: focus && !hot ? 0.35 : 1 } : undefined}
                  transition={{ pathLength: { duration: 0.9, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.3 } }}
                />
                {!reduced && inView && (
                  <circle r="0.7" fill="var(--acc)">
                    <animateMotion dur={`${2.4 + (i % 3) * 0.7}s`} begin={`${1 + i * 0.25}s`} repeatCount="indefinite" path={d} />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>
        {arch.edges.map((e, i) => {
          if (!e.label) return null;
          const a = byId.get(e.from)!;
          const b = byId.get(e.to)!;
          return (
            <span
              key={`l${i}`}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-[130%] rounded bg-bg px-1 font-mono text-[10px] whitespace-nowrap text-dim"
              style={{ left: `${(((a.x + b.x) / 2) / W) * 100}%`, top: `${(((a.y + b.y) / 2) / H) * 100}%` }}
            >
              {e.label}
            </span>
          );
        })}
        {arch.nodes.map((n, i) => (
          <motion.button
            key={n.id}
            type="button"
            onMouseEnter={() => setFocus(n.id)}
            onMouseLeave={() => setFocus(null)}
            onFocus={() => setFocus(n.id)}
            onBlur={() => setFocus(null)}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border px-2.5 py-1.5 text-[12px] font-medium whitespace-nowrap shadow-float transition-colors duration-300",
              n.tone === "acc" ? "border-acc/60 bg-panel text-ink" : n.tone === "muted" ? "border-dashed border-line bg-panel-2 text-fog" : "border-line bg-panel text-ink",
              focus === n.id && "border-acc text-acc",
              focus && focus !== n.id && !linked(n.id) && "border-line bg-panel-2 text-dim shadow-none"
            )}
            style={{ left: `${(n.x / W) * 100}%`, top: `${(n.y / H) * 100}%` }}
            initial={reduced ? false : { opacity: 0, scale: 0.85 }}
            animate={inView || reduced ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            {n.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
