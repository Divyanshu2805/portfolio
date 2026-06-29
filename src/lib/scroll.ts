"use client";

import type Lenis from "lenis";

/** The page's Lenis instance, when smooth scrolling is on (not with reduced motion). */
let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

/**
 * Scrolls to a "#id" target on this page, smoothly when Lenis is running.
 * Callers that can run off the home page route there themselves (TopNav, palette).
 */
export function scrollToHash(hash: string) {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { offset: -72 });
  else target.scrollIntoView({ behavior: "auto", block: "start" });
  history.replaceState(null, "", hash);
}

/** Tells the command palette to open; the palette listens for this event. */
export function openPalette() {
  window.dispatchEvent(new Event("palette:open"));
}
