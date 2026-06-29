"use client";

import { DATA } from "@/data/resume";
import { openPalette, scrollToHash } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

const LINKS = [
  { id: "work", label: "Work" },
  { id: "journey", label: "Journey" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

/**
 * Floating pill: monogram, scroll-spy links with a sliding indicator, the
 * command palette and the theme toggle. Tucks away while scrolling down and
 * returns on the way up. A hairline along the top edge shows page progress.
 */
export function TopNav() {
  const [active, setActive] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [mac, setMac] = useState(true);
  const pathname = usePathname();
  const home = pathname === "/";
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > 400 && y > prev + 4);
    if (y < prev - 4) setHidden(false);
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    const top = document.getElementById("top");
    if (top) observer.observe(top);
    const frame = requestAnimationFrame(() => setMac(/Mac|iPhone|iPad/.test(navigator.userAgent)));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-acc"
        style={{ scaleX: progress }}
      />
      <motion.header
        className="fixed inset-x-0 top-3 z-40 flex justify-center px-4"
        animate={{ y: hidden ? -90 : 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav
          aria-label="Main"
          className="flex items-center gap-1 rounded-full border border-line bg-panel/75 p-1.5 shadow-float backdrop-blur-xl"
        >
          <Link
            href="/#top"
            onClick={(e) => {
              if (!home) return;
              e.preventDefault();
              scrollToHash("#top");
            }}
            className="group grid size-9 place-items-center rounded-full bg-ink font-mono text-[11px] font-bold text-bg"
            aria-label={`${DATA.name}, back to top`}
          >
            <span className="transition-transform duration-500 ease-out-expo group-hover:-rotate-12 group-hover:scale-110">
              {DATA.initials}
            </span>
          </Link>

          <ul className="hidden items-center sm:flex">
            {LINKS.map(({ id, label }) => (
              <li key={id}>
                <Link
                  href={`/#${id}`}
                  onClick={(e) => {
                    if (!home) return;
                    e.preventDefault();
                    scrollToHash(`#${id}`);
                  }}
                  aria-current={home && active === id ? "true" : undefined}
                  className={cn(
                    "relative block rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition-colors",
                    home && active === id ? "text-ink" : "text-fog hover:text-ink"
                  )}
                >
                  {home && active === id && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-panel-2"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={openPalette}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] sm:pr-1.5 font-medium text-fog transition-colors hover:bg-panel-2 hover:text-ink"
            aria-label="Open command menu"
          >
            <span className="sm:hidden">Menu</span>
            <kbd className="hidden rounded-md border border-b-2 border-line bg-panel-2 px-1.5 font-mono text-[10.5px] text-fog sm:inline-block">
              {mac ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>
          <ThemeToggle />
        </nav>
      </motion.header>
    </>
  );
}
