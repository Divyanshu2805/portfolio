"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/*
 * The page as an engineering drawing sheet: rulers run down both edges and
 * scroll with the page, and the left margin carries a title-block style
 * label for the section you're in with your position down the sheet.
 * Only on wide screens, where the margins are empty anyway.
 */

export function SheetFrame() {
  const root = useRef<HTMLDivElement>(null);
  const coord = useRef<HTMLSpanElement>(null);
  const [section, setSection] = useState("");
  const pathname = usePathname();
  const { scrollY, scrollYProgress } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    root.current?.style.setProperty("--sheet-y", `${-y}px`);
  });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (coord.current) coord.current.textContent = `${String(Math.round(p * 100)).padStart(3, "0")}%`;
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setSection((e.target as HTMLElement).dataset.sheet ?? "");
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    document.querySelectorAll("[data-sheet]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-y-0 inset-x-0 z-0 hidden xl:block">
      <div className="sheet-ruler absolute inset-y-0 left-5 w-3 opacity-70" />
      <div className="sheet-ruler absolute inset-y-0 right-5 w-3 -scale-x-100 opacity-70" />
      <div className="absolute bottom-24 left-10 flex rotate-180 items-center gap-3 font-mono text-[10.5px] tracking-[0.12em] whitespace-nowrap text-dim uppercase [writing-mode:vertical-rl]">
        <span className="text-fog">{section || "Index"}</span>
        <span className="h-8 w-px bg-line" />
        <span ref={coord}>000%</span>
      </div>
      <div className="absolute top-28 right-10 font-mono text-[10.5px] tracking-[0.12em] whitespace-nowrap text-dim uppercase [writing-mode:vertical-rl]">
        DA · Portfolio · Rev 2
      </div>
    </div>
  );
}
