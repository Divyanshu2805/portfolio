"use client";

import { useLoopClock } from "@/hooks/use-live";
import { passed, typed } from "@/lib/anim";
import { cn } from "@/lib/utils";
import type { MiniProps } from "./types";

/*
 * BitBin: the library sits behind, ⌘K opens, a query types itself, results
 * filter, the selection walks down, Enter opens the item and it is copied.
 * Graphite editor surfaces, lime, and a colour per item type, like the app.
 */

const CYCLE = 10000;
const REST = 7000;

type Item = { type: keyof typeof TYPES; title: string; k: string };
const TYPES = {
  snippet: { label: "snip", color: "#60a5fa" },
  prompt: { label: "prompt", color: "#a78bfa" },
  command: { label: "cmd", color: "#fb923c" },
  note: { label: "note", color: "#eab308" },
  link: { label: "link", color: "#34d399" },
} as const;

const ITEMS: Item[] = [
  { type: "command", title: "docker system prune -af", k: "docker" },
  { type: "snippet", title: "useDebounce.ts", k: "react" },
  { type: "snippet", title: "docker-compose.pg.yml", k: "docker" },
  { type: "prompt", title: "Review this diff for races", k: "review" },
  { type: "note", title: "Docker networking notes", k: "docker" },
  { type: "link", title: "Postgres EXPLAIN visualiser", k: "sql" },
];
const QUERY = "docker";
const SIDEBAR: [keyof typeof TYPES, string, number][] = [
  ["snippet", "Snippets", 48],
  ["prompt", "Prompts", 21],
  ["command", "Commands", 37],
  ["note", "Notes", 16],
  ["link", "Links", 29],
];

export function BitBinMini({ active, compact = false }: MiniProps) {
  const t = useLoopClock(active, CYCLE, REST);
  const open = t > 700 && t < 3900;
  const query = typed(QUERY, t, 1100, 95);
  const filtering = query.length >= 3;
  const results = filtering ? ITEMS.filter((i) => i.k.startsWith(query.slice(0, 3))) : ITEMS;
  const sel = Math.min(results.length - 1, passed([2700, 3200], t));
  const detail = t >= 3900 && t < 8200;
  const copied = t >= 4900 && t < 8200;

  const palette = (
    <div
      className={cn(
        "rounded-lg border border-line bg-panel shadow-float transition-all duration-300",
        compact ? "" : "absolute inset-x-[8%] top-[10%] z-10",
        open || compact ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
      )}
    >
      <div className="flex items-center gap-2 border-b border-line px-2.5 py-2 font-mono text-[11.5px]">
        <span className="text-acc">⌘K</span>
        <span className="min-w-0 flex-1 truncate">
          {query || <span className="text-dim">Search everything…</span>}
          {open && t < 1800 && <span className="caret text-acc" />}
        </span>
        <span className="text-[10px] text-dim">{results.length} results</span>
      </div>
      <ul className="grid gap-0.5 p-1.5">
        {(compact ? ITEMS : results).map((item, i) => {
          const hit = !compact || !filtering || item.k === "docker";
          const selected = hit && results.indexOf(item) === sel && t > 2200;
          return (
            <li
              key={item.title}
              className={cn(
                "flex items-center gap-2 overflow-hidden rounded-md px-2 py-1 font-mono text-[11px] whitespace-nowrap transition-all duration-300",
                selected && "bg-acc/15",
                !hit && "opacity-25"
              )}
            >
              <span
                className="flex-none rounded border px-1.5 text-[9px] font-semibold"
                style={{ color: TYPES[item.type].color, borderColor: TYPES[item.type].color }}
              >
                {TYPES[item.type].label}
              </span>
              <span className="truncate">{item.title}</span>
              {selected && <span className="ml-auto text-[10px] text-dim">↵</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );

  if (compact) return <div className="h-full p-3">{palette}</div>;

  return (
    <div className="relative grid h-full grid-cols-1 @lg:grid-cols-[150px_1fr]">
      <aside className="hidden border-r border-line p-3 @lg:grid content-start gap-1">
        <span className="mb-1 font-display text-[13px] font-extrabold tracking-tight">
          bit<span className="text-acc">bin</span>
        </span>
        {SIDEBAR.map(([type, label, n]) => (
          <span key={type} className="flex items-center gap-2 rounded-md px-1.5 py-1 text-[11px] text-fog">
            <i className="block size-2 rounded-full" style={{ background: TYPES[type].color }} />
            {label}
            <span className="ml-auto font-mono text-[10px] text-dim">{n}</span>
          </span>
        ))}
      </aside>

      <div className="relative min-w-0 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[12px] font-semibold">All items</span>
          <span className="rounded border border-line px-1.5 font-mono text-[10px] text-dim">⌘K</span>
        </div>
        <div className={cn("grid grid-cols-2 gap-2 transition-all duration-500", (open || detail) && "opacity-30 blur-[1px]")}>
          {ITEMS.slice(0, 4).map((item) => (
            <div key={item.title} className="grid gap-1 rounded-md border border-line bg-panel-2 p-2">
              <span className="font-mono text-[9px] font-semibold" style={{ color: TYPES[item.type].color }}>
                {TYPES[item.type].label}
              </span>
              <span className="truncate text-[10.5px]">{item.title}</span>
              <span className="h-1.5 w-3/4 rounded bg-line" />
            </div>
          ))}
        </div>

        {palette}

        <div
          className={cn(
            "absolute inset-x-3 top-10 z-10 grid gap-2 rounded-lg border border-line bg-panel p-3 shadow-float transition-all duration-500",
            detail ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-[12px] font-semibold">docker system prune -af</span>
            <span className={cn("flex-none rounded-full px-2 py-0.5 font-mono text-[9.5px] transition-colors", copied ? "bg-acc/20 text-acc" : "text-dim")}>
              {copied ? "✓ copied" : "copy"}
            </span>
          </div>
          <pre className="m-0 rounded-md bg-bg p-2 font-mono text-[10.5px] leading-relaxed">
            <span className="text-dim"># free disk: stopped containers, unused images, networks{"\n"}</span>
            <span className="text-acc">docker</span> system prune <span className="text-[#fb923c]">-af</span>{" "}
            <span className="text-[#fb923c]">--volumes</span>
          </pre>
          <div className="flex flex-wrap gap-1.5">
            {["docker", "cleanup", "disk"].map((tag, i) => (
              <span
                key={tag}
                className={cn("rounded-full border border-line px-2 font-mono text-[9.5px] text-fog", t > 5600 + i * 250 ? "pop" : "opacity-0")}
              >
                #{tag}
              </span>
            ))}
            {t > 6400 && <span className="pop font-mono text-[9.5px] text-acc">AI tags</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
