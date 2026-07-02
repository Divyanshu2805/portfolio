"use client";

import { useReducedMotion } from "@/hooks/use-live";
import { Reveal, RiseText } from "@/components/site/motion-text";
import { DATA, findWork } from "@/data/resume";
import { scrollToHash } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const ALL = DATA.skills.flatMap((g) => g.items);
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Skills grouped by area. Pointing at or picking a skill fills the panel with
 * the projects and roles where it was used, so every skill has evidence.
 */
export function Skills() {
  const reduced = useReducedMotion();
  const [picked, setPicked] = useState("Spring Boot");
  const [preview, setPreview] = useState<string | null>(null);
  const current = ALL.find((s) => s.name === (preview ?? picked)) ?? ALL[0];
  const evidence = current.in.map(findWork).filter((w) => w !== null);

  return (
    <section id="skills" data-accent="ion" data-sheet="Skills" aria-label={DATA.sections.skills.title} className="mx-auto max-w-page scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32">
      <div className="mb-14 grid gap-4">
        <RiseText
          text={DATA.sections.skills.title}
          className="font-display text-[clamp(2.6rem,6.5vw,5rem)] leading-[0.95] font-extrabold tracking-[-0.05em]"
        />
        <Reveal>
          <p className="max-w-[52ch] text-[17px] text-fog">{DATA.sections.skills.intro}</p>
        </Reveal>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
        <div className="grid gap-7" onMouseLeave={() => setPreview(null)}>
          {DATA.skills.map((group, gi) => (
            <Reveal key={group.area} delay={gi * 0.04} className="grid gap-3">
              <h3 className="font-mono text-[12px] tracking-wide text-dim">{group.area}</h3>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((skill) => {
                  const on = skill.name === current.name;
                  return (
                    <li key={skill.name}>
                      <button
                        type="button"
                        aria-pressed={skill.name === picked}
                        onClick={() => setPicked(skill.name)}
                        onMouseEnter={() => setPreview(skill.name)}
                        className={cn(
                          "relative isolate rounded-full border px-3.5 py-1.5 text-[14px] font-medium transition-[color,border-color,transform] duration-300 active:scale-[0.96]",
                          on ? "border-acc text-ink" : "border-line text-fog hover:border-fog hover:text-ink"
                        )}
                      >
                        {on && (
                          <motion.span
                            layoutId="skill-pill"
                            className="absolute inset-0 -z-10 rounded-full bg-acc/15"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        )}
                        {skill.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          ))}
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-float" aria-live="polite">
            <div className="border-b border-line px-6 py-5">
              <span className="font-mono text-[12px] text-dim">Used in {evidence.length} {evidence.length === 1 ? "place" : "places"}</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={current.name}
                  initial={reduced ? false : { opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduced ? undefined : { opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="mt-1 font-display text-[clamp(1.8rem,3.5vw,2.4rem)] leading-tight font-extrabold tracking-[-0.04em]"
                >
                  {current.name}
                </motion.p>
              </AnimatePresence>
            </div>
            <ul className="grid">
              <AnimatePresence initial={false} mode="popLayout">
                {evidence.map((w, i) => (
                  <motion.li
                    key={`${current.name}-${w.id}`}
                    layout={!reduced}
                    initial={reduced ? false : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduced ? undefined : { opacity: 0, x: -12 }}
                    transition={{ duration: 0.35, ease: EASE, delay: i * 0.05 }}
                    data-scope={w.accent}
                    className="border-b border-line last:border-b-0"
                  >
                    <a
                      href={w.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToHash(w.href);
                      }}
                      className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-panel-2"
                    >
                      <span aria-hidden className="size-2.5 flex-none rounded-full bg-acc" />
                      <span className="grid min-w-0 flex-1">
                        <span className="truncate text-[16px] font-semibold">{w.title}</span>
                        <span className="truncate text-[13px] text-fog">{w.detail}</span>
                      </span>
                      <span className="text-acc transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </a>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
