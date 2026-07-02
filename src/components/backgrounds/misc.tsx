import { hash } from "@/lib/anim";
import { cn } from "@/lib/utils";

/*
 * Section backgrounds drawn from my own world, all pure CSS/SVG:
 * DiffRain for Proveout and Skidpad for Team Fateh (ScopeTrace, above Contact,
 * lives in scope-trace.tsx).
 */

/** A faint, endless code diff rising behind the Proveout band. */
export function DiffRain({ className }: { className?: string }) {
  const rows = Array.from({ length: 48 }, (_, i) => {
    const kind = hash(i * 3.1) < 0.18 ? "add" : hash(i * 7.7) < 0.12 ? "del" : "ctx";
    const indent = Math.floor(hash(i * 1.9) * 5);
    const width = 18 + Math.round(hash(i * 5.3) * 52);
    return { kind, indent, width };
  });
  const block = rows.map((r, i) => (
    <div key={i} className="flex h-[22px] items-center gap-3">
      <span
        className={cn(
          "w-3 text-center font-mono text-[12px]",
          r.kind === "add" && "text-ok",
          r.kind === "del" && "text-bad",
          r.kind === "ctx" && "text-dim"
        )}
      >
        {r.kind === "add" ? "+" : r.kind === "del" ? "−" : ""}
      </span>
      <span
        className={cn(
          "h-[7px] rounded-full",
          r.kind === "add" ? "bg-ok/25" : r.kind === "del" ? "bg-bad/25" : "bg-line"
        )}
        style={{ width: `${r.width}%`, marginLeft: `${r.indent * 16}px` }}
      />
    </div>
  ));
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_55%,#000_85%,transparent)]",
        className
      )}
    >
      <div className="diff-rain absolute top-0 right-0 w-[min(620px,70%)] opacity-70">
        {block}
        {block}
      </div>
    </div>
  );
}

/** The skidpad figure-eight with a car lapping it. */
export function Skidpad({ className }: { className?: string }) {
  const d = "M60 40 A26 26 0 0 1 8 40 A26 26 0 0 1 60 40 A26 26 0 0 0 112 40 A26 26 0 0 0 60 40";
  return (
    <svg viewBox="0 0 120 80" className={cn("overflow-visible", className)} role="img" aria-label="Skidpad figure-eight">
      <path d={d} fill="none" stroke="var(--line)" strokeWidth="9" strokeLinecap="round" />
      <path d={d} fill="none" stroke="var(--dim)" strokeWidth="0.6" strokeDasharray="2 3" />
      <circle className="skid-car" r="3.2" fill="var(--acc)" />
    </svg>
  );
}
