"use client";

import { useReducedMotion } from "@/hooks/use-live";
import { cn } from "@/lib/utils";
import { animate, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Heading whose words rise through a mask the first time it scrolls into view.
 * Screen readers get the plain text.
 */
export function RiseText({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.2em] -mb-[0.2em] align-bottom">
          {reduced ? (
            <span className="inline-block">
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          ) : (
            <motion.span
              data-reveal
              className="inline-block"
              initial={{ y: "110%" }}
              animate={inView ? { y: 0 } : undefined}
              transition={{ duration: 0.9, ease: EASE, delay: delay + i * 0.045 }}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          )}
        </span>
      ))}
    </Tag>
  );
}

/** Fades and lifts its children in, once, as they enter the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "article" | "section";
}) {
  const reduced = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      data-reveal
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={reduced ? { duration: 0 } : { duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

/** Counts up to `value` once when it scrolls into view, with steady-width digits. */
export function Counter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
  delay = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const reduced = useReducedMotion();
  const format = (v: number) =>
    prefix + v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
  const [shown, setShown] = useState(() => format(0));

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, value, {
      duration: 1.4,
      delay,
      ease: EASE,
      onUpdate: (v) => setShown(format(v)),
    });
    return () => controls.stop();
    // format depends only on props already listed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, value, delay]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {reduced ? format(value) : shown}
    </span>
  );
}
