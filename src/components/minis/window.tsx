import type { Accent } from "@/data/resume";
import { cn } from "@/lib/utils";

/**
 * Browser-style chrome around a product miniature. The first traffic light and
 * the host carry the product's own accent.
 */
export function MiniWindow({
  host,
  accent,
  className,
  children,
  tone = "panel",
}: {
  host: string;
  accent: Accent;
  className?: string;
  children: React.ReactNode;
  tone?: "panel" | "bg";
}) {
  return (
    <div
      data-scope={accent}
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-line shadow-float",
        tone === "panel" ? "bg-panel" : "bg-bg",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-line bg-panel-2 px-3 py-2">
        <div className="flex gap-1.5" aria-hidden>
          <i className="block size-2.5 rounded-full bg-acc" />
          <i className="block size-2.5 rounded-full bg-line" />
          <i className="block size-2.5 rounded-full bg-line" />
        </div>
        <span className="min-w-0 truncate rounded-md border border-line bg-panel px-2.5 py-0.5 font-mono text-[11px] text-dim">
          {host}
        </span>
      </div>
      <div className="@container relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

/** Small round status mark used by checklists across miniatures. */
export function Tick({ state }: { state: "todo" | "run" | "done" | "fail" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-3.5 flex-none place-items-center rounded-full border-[1.5px] font-mono text-[8px] font-bold",
        state === "todo" && "border-line",
        state === "run" && "spin border-acc border-t-transparent",
        state === "done" && "pop border-acc bg-acc text-panel",
        state === "fail" && "pop border-bad bg-bad text-panel"
      )}
    >
      {state === "done" ? "✓" : state === "fail" ? "✕" : ""}
    </span>
  );
}
