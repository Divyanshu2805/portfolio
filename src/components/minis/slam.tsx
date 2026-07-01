"use client";

import { useLoopClock } from "@/hooks/use-live";
import { useEffect, useRef } from "react";
import type { MiniProps } from "./types";

/*
 * MITACS: a drone flies goal to goal through a GPS-denied maze while a lidar
 * sweep reveals the occupancy map around it, the way slam_toolbox builds one.
 */

const MAZE = [
  "######################",
  "#......#.......#.....#",
  "#.####.#.#####.#.###.#",
  "#.#....#.#...#...#...#",
  "#.#.####.#.#.#####.###",
  "#.#......#.#.......#.#",
  "#.######.#.#######.#.#",
  "#......#...#.....#...#",
  "######.#####.###.###.#",
  "#......#.....#.#.....#",
  "#.######.#####.#####.#",
  "#....................#",
  "######################",
];
const COLS = MAZE[0].length;
const ROWS = MAZE.length;
/** Goals the drone flies between, in order (col, row); the route between them is found by BFS. */
const GOALS: [number, number][] = [[1, 1], [8, 5], [1, 11], [12, 3], [20, 11], [20, 1], [16, 3]];

function route(from: [number, number], to: [number, number]): [number, number][] {
  const key = (c: number, r: number) => r * COLS + c;
  const prev = new Map<number, number>([[key(...from), -1]]);
  const queue: [number, number][] = [from];
  while (queue.length) {
    const [c, r] = queue.shift()!;
    if (c === to[0] && r === to[1]) break;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc;
      const nr = r + dr;
      if (MAZE[nr]?.[nc] === "." && !prev.has(key(nc, nr))) {
        prev.set(key(nc, nr), key(c, r));
        queue.push([nc, nr]);
      }
    }
  }
  const path: [number, number][] = [];
  for (let k = key(...to); k !== -1; k = prev.get(k) ?? -1) path.unshift([k % COLS, Math.floor(k / COLS)]);
  return path;
}

const PATH: [number, number][] = GOALS.slice(1).flatMap((goal, i) => route(GOALS[i], goal).slice(i === 0 ? 0 : 1));
const SEGMENTS = PATH.slice(1).map((p, i) => Math.hypot(p[0] - PATH[i][0], p[1] - PATH[i][1]));
const LENGTH = SEGMENTS.reduce((a, b) => a + b, 0);
const RADIUS = 3.2;

function positionAt(d: number): [number, number] {
  let left = d;
  for (let i = 0; i < SEGMENTS.length; i++) {
    if (left <= SEGMENTS[i]) {
      const k = SEGMENTS[i] === 0 ? 0 : left / SEGMENTS[i];
      return [PATH[i][0] + (PATH[i + 1][0] - PATH[i][0]) * k, PATH[i][1] + (PATH[i + 1][1] - PATH[i][1]) * k];
    }
    left -= SEGMENTS[i];
  }
  return PATH[PATH.length - 1];
}

/** Distance along the path at which each cell first falls inside the lidar radius. */
const REVEAL_AT: number[] = (() => {
  const at = new Array<number>(COLS * ROWS).fill(Infinity);
  for (let d = 0; d <= LENGTH; d += 0.25) {
    const [x, y] = positionAt(d);
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        if (at[i] === Infinity && Math.hypot(c - x, r - y) <= RADIUS) at[i] = d;
      }
  }
  return at;
})();

const CYCLE = 18000;
const FLY = 15500;
const REST = FLY;

export function SlamMini({ active }: MiniProps) {
  const t = useLoopClock(active, CYCLE, REST);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = el.getBoundingClientRect();
    if (el.width !== Math.round(width * dpr)) {
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(el);
    const fog = css.getPropertyValue("--fog").trim();
    const acc = css.getPropertyValue("--acc").trim();
    const cell = Math.min(width / COLS, height / ROWS);
    const ox = (width - cell * COLS) / 2;
    const oy = (height - cell * ROWS) / 2;
    const d = Math.min(1, t / FLY) * LENGTH;
    const [px, py] = positionAt(d);

    ctx.clearRect(0, 0, width, height);
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (REVEAL_AT[r * COLS + c] > d) continue;
        const wall = MAZE[r][c] === "#";
        ctx.fillStyle = wall ? fog : acc;
        ctx.globalAlpha = wall ? 0.55 : 0.07;
        ctx.fillRect(ox + c * cell + 0.5, oy + r * cell + 0.5, cell - 1, cell - 1);
      }
    ctx.globalAlpha = 1;

    // Flown path
    ctx.strokeStyle = acc;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let s = 0; s <= d; s += 0.2) {
      const [x, y] = positionAt(s);
      const X = ox + (x + 0.5) * cell;
      const Y = oy + (y + 0.5) * cell;
      if (s === 0) ctx.moveTo(X, Y);
      else ctx.lineTo(X, Y);
    }
    ctx.stroke();

    // Lidar sweep and drone
    const cx = ox + (px + 0.5) * cell;
    const cy = oy + (py + 0.5) * cell;
    const a = (t / 260) % (Math.PI * 2);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, RADIUS * cell);
    g.addColorStop(0, acc);
    g.addColorStop(1, "transparent");
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, RADIUS * cell, a, a + 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = acc;
    ctx.beginPath();
    ctx.arc(cx, cy, cell * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }, [t]);

  const mapped = Math.round((Math.min(1, t / FLY) ** 0.8) * 100);
  return (
    <div className="grid h-full grid-rows-[1fr_auto] gap-2 p-3">
      <canvas ref={canvas} className="h-full min-h-[120px] w-full" role="img" aria-label="Occupancy map being built by a drone's lidar in a maze" />
      <div className="flex justify-between font-mono text-[10px] text-dim">
        <span>slam_toolbox · GPS-denied maze</span>
        <span className="tabular-nums">{mapped}% mapped</span>
      </div>
    </div>
  );
}
