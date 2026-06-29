"use client";

import { setLenis } from "@/lib/scroll";
import Lenis from "lenis";
import { useEffect } from "react";

/** Lenis smooth scrolling with light damping. Off for reduced motion; never hijacks. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const instance = new Lenis({ autoRaf: true, lerp: 0.11, anchors: { offset: -72 }, stopInertiaOnNavigate: true });
    setLenis(instance);
    return () => {
      setLenis(null);
      instance.destroy();
    };
  }, []);
  return null;
}
