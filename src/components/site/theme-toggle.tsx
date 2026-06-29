"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";

/** Theme switch that wipes the new theme in from the button with a View Transition. */
export function useToggleTheme() {
  const { resolvedTheme, setTheme } = useTheme();
  return (origin?: HTMLElement | null) => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduced) {
      setTheme(next);
      return;
    }
    const rect = origin?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : 0;
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const root = document.documentElement;
    root.classList.add("theme-wipe");
    const transition = document.startViewTransition(() => flushSync(() => setTheme(next)));
    transition.finished.finally(() => root.classList.remove("theme-wipe"));
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    });
  };
}

export function ThemeToggle() {
  const toggle = useToggleTheme();
  return (
    <button
      type="button"
      onClick={(e) => toggle(e.currentTarget)}
      className="grid size-9 place-items-center rounded-full text-fog transition-colors hover:bg-panel-2 hover:text-ink"
      aria-label="Toggle theme"
    >
      <SunIcon className="size-4 dark:hidden" />
      <MoonIcon className="hidden size-4 dark:block" />
    </button>
  );
}
