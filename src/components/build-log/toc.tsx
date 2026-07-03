"use client";

import { scrollToHash } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

/** Sticky contents for a case study, with the current part marked as you read. */
export function Toc({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="sticky top-28 grid gap-0.5">
      <span className="mb-2 font-mono text-[11px] tracking-wide text-dim">On this page</span>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            scrollToHash(`#${item.id}`);
          }}
          className={cn(
            "relative rounded-md py-1.5 pr-2 pl-4 text-[13.5px] leading-snug transition-colors",
            active === item.id ? "text-ink" : "text-dim hover:text-fog"
          )}
        >
          {active === item.id && (
            <motion.span
              layoutId="toc-mark"
              className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full bg-acc"
              transition={{ type: "spring", stiffness: 400, damping: 34 }}
            />
          )}
          {item.label}
        </a>
      ))}
    </nav>
  );
}
