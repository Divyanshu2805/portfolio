"use client";

import { usePageVisible, useReducedMotion } from "@/hooks/use-live";
import { useInView } from "motion/react";
import { useEffect, useRef } from "react";

/*
 * A PCB behind the hero: traces routed on a grid with 45° bends, vias at the
 * ends, and signal pulses running along them in the current accent. Traces
 * near the pointer light up, as if you were probing the board. Drawn on a
 * canvas; runs only while visible and is a still board for reduced motion.
 */

type Trace = { pts: [number, number][]; len: number; speed: number; offset: number };

const CELL = 22;
const DIRS: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
];

/** Small deterministic PRNG so the board is the same on every visit. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function route(cols: number, rows: number, count: number): Trace[] {
  const rand = rng(2805);
  const used = new Set<number>();
  const key = (c: number, r: number) => r * cols + c;
  const traces: Trace[] = [];
  for (let n = 0; n < count * 4 && traces.length < count; n++) {
    let c = Math.floor(rand() * cols);
    let r = Math.floor(rand() * rows);
    if (used.has(key(c, r))) continue;
    let d = Math.floor(rand() * 4) * 2; // start orthogonal
    const pts: [number, number][] = [[c, r]];
    used.add(key(c, r));
    const steps = 6 + Math.floor(rand() * 16);
    for (let i = 0; i < steps; i++) {
      if (rand() < 0.22) d = (d + (rand() < 0.5 ? 1 : 7)) % 8; // bend by 45°
      const [dc, dr] = DIRS[d];
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows || used.has(key(nc, nr))) break;
      c = nc;
      r = nr;
      used.add(key(c, r));
      pts.push([c, r]);
    }
    if (pts.length < 4) continue;
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    traces.push({ pts, len, speed: 2 + rand() * 4, offset: rand() * 40 });
  }
  return traces;
}

function pointAt(t: Trace, d: number): [number, number] {
  let left = d;
  for (let i = 1; i < t.pts.length; i++) {
    const [ax, ay] = t.pts[i - 1];
    const [bx, by] = t.pts[i];
    const seg = Math.hypot(bx - ax, by - ay);
    if (left <= seg) return [ax + ((bx - ax) * left) / seg, ay + ((by - ay) * left) / seg];
    left -= seg;
  }
  return t.pts[t.pts.length - 1];
}

export function CircuitField({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const inView = useInView(canvas, { amount: 0.05 });
  const visible = usePageVisible();
  const reduced = useReducedMotion();
  const pointer = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const host = el.parentElement!;
    let traces: Trace[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    const start = performance.now();

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);
      traces = route(cols, rows, Math.round((cols * rows) / (w < 640 ? 70 : 52)));
    };

    const draw = (now: number) => {
      const css = getComputedStyle(el);
      const line = css.getPropertyValue("--line").trim();
      const acc = css.getPropertyValue("--acc").trim();
      const time = (now - start) / 1000;
      const p = pointer.current;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (const t of traces) {
        const X = (c: number) => c * CELL + CELL / 2;
        // Base copper
        ctx.globalAlpha = 0.75;
        ctx.strokeStyle = line;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        t.pts.forEach(([c, r], i) => (i ? ctx.lineTo(X(c), X(r)) : ctx.moveTo(X(c), X(r))));
        ctx.stroke();
        // Pads at both ends
        ctx.globalAlpha = 1;
        for (const [c, r] of [t.pts[0], t.pts[t.pts.length - 1]]) {
          ctx.fillStyle = line;
          ctx.beginPath();
          ctx.arc(X(c), X(r), 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
        // Probe: traces near the pointer glow
        if (p) {
          let near = Infinity;
          for (const [c, r] of t.pts) near = Math.min(near, Math.hypot(X(c) - p.x, X(r) - p.y));
          if (near < 140) {
            ctx.globalAlpha = 0.55 * (1 - near / 140);
            ctx.strokeStyle = acc;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            t.pts.forEach(([c, r], i) => (i ? ctx.lineTo(X(c), X(r)) : ctx.moveTo(X(c), X(r))));
            ctx.stroke();
          }
        }
        if (reduced) continue;
        // Signal pulse: a short bright run along the trace, then a pause
        const period = t.len + 8;
        const head = ((time * t.speed + t.offset) % period) - 1;
        if (head < 0 || head > t.len + 2) continue;
        ctx.strokeStyle = acc;
        ctx.lineWidth = 1.8;
        for (let k = 0; k < 8; k++) {
          const a = head - k * 0.25;
          const b = a - 0.25;
          if (b < 0 || a > t.len) continue;
          const [x1, y1] = pointAt(t, a);
          const [x2, y2] = pointAt(t, b);
          ctx.globalAlpha = 0.9 * (1 - k / 8);
          ctx.beginPath();
          ctx.moveTo(X(x1), X(y1));
          ctx.lineTo(X(x2), X(y2));
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      if (reduced) draw(performance.now());
    };
    const onLeave = () => {
      pointer.current = null;
      if (reduced) draw(performance.now());
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(el);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    if (!reduced && inView && visible) raf = requestAnimationFrame(loop);
    else draw(performance.now());

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [inView, visible, reduced]);

  return <canvas ref={canvas} aria-hidden className={className} />;
}
