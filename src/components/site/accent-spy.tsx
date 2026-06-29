"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Hands the page accent to whatever is in the middle of the viewport:
 * any element with data-accent="<key>" sets :root[data-accent] while it
 * crosses the centre line. CSS transitions --acc between product colours.
 */
export function AccentSpy() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) root.dataset.accent = (entry.target as HTMLElement).dataset.accent;
        }
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    document.querySelectorAll("[data-accent]").forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      delete root.dataset.accent;
    };
  }, [pathname]);
  return null;
}
