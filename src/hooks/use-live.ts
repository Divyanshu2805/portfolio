"use client";

import { useInView } from "motion/react";
import { type RefObject, useEffect, useRef, useState, useSyncExternalStore } from "react";

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

/** False while the tab is hidden, so loops stop burning CPU in the background. */
export function usePageVisible() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => true
  );
}

/** True while the element is on screen and the tab is visible. */
export function useLive(ref: RefObject<Element | null>, amount = 0.25) {
  const inView = useInView(ref, { amount });
  const visible = usePageVisible();
  return inView && visible;
}

/**
 * A looping clock for miniatures: returns milliseconds into a `cycle`-long loop,
 * advancing only while `active`. With reduced motion it returns `rest` (the
 * finished frame) and never ticks. Updates ~24 times a second, which is plenty
 * for UI mockups and keeps React work small.
 */
export function useLoopClock(active: boolean, cycle: number, rest: number, initial = 0) {
  const reduced = useReducedMotion();
  const [t, setT] = useState(initial);
  const elapsed = useRef(initial);

  useEffect(() => {
    if (!active || reduced) return;
    let raf = 0;
    let last = performance.now();
    let since = 0;
    const tick = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      elapsed.current = (elapsed.current + dt) % cycle;
      since += dt;
      if (since >= 40) {
        since = 0;
        setT(elapsed.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced, cycle]);

  return reduced ? rest : t;
}

/** Media query as a hook (e.g. fine pointer). Server render assumes false. */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", onChange);
      return () => m.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/**
 * prefers-reduced-motion, safe for hydration: the first client render matches
 * the server (motion allowed), then updates. Motion's own hook reads the media
 * query during hydration and causes mismatches.
 */
export function useReducedMotion() {
  return useMedia("(prefers-reduced-motion: reduce)");
}
