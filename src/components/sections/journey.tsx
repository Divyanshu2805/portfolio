"use client";

import { LiveMini } from "@/components/minis";
import { MiniWindow } from "@/components/minis/window";
import { Counter, Reveal, RiseText } from "@/components/site/motion-text";
import { DATA, type JourneyEntry } from "@/data/resume";
import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { Skidpad } from "@/components/backgrounds/misc";
import { Label } from "./work";

const ordinal = (n: number) => (n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th");

function Entry({ entry }: { entry: JourneyEntry }) {
  return (
    <article
      id={`journey-${entry.id}`}
      data-accent={entry.accent}
      data-scope={entry.accent}
      className="relative grid scroll-mt-24 gap-4 pl-9 md:grid-cols-[112px_1fr] md:gap-10 md:pl-0"
    >
      {/* Node on the rail */}
      <span
        aria-hidden
        className="absolute top-2 left-[3px] size-[11px] rounded-full border-2 border-acc bg-bg md:left-[131px]"
      />
      <div className="md:sticky md:top-28 md:self-start">
        <span className="font-display text-[22px] font-bold tracking-tight text-acc md:text-[28px]">{entry.when}</span>
      </div>

      <div className="grid gap-6 md:pl-10">
        <Reveal className="grid gap-1.5">
          <h3 className="font-display text-[clamp(1.7rem,3.4vw,2.4rem)] leading-tight font-extrabold tracking-[-0.04em]">{entry.org}</h3>
          <p className="text-[15px] text-fog">{entry.unit}</p>
          <p className="font-mono text-[12px] text-dim">{entry.location}</p>
        </Reveal>

        <div className={entry.mini ? "grid gap-6 lg:grid-cols-[1fr_300px]" : "grid gap-6"}>
          <div className="grid content-start gap-6">
            {entry.roles.map((role) => (
              <Reveal key={role.title} className="grid gap-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h4 className="text-[17px] font-semibold">{role.title}</h4>
                  <span className="font-mono text-[12px] text-dim">{role.period}</span>
                </div>
                <ul className="grid gap-2 text-[15px] leading-relaxed text-fog">
                  {role.bullets.map((b) => (
                    <li key={b} className="grid grid-cols-[14px_1fr]">
                      <span aria-hidden className="text-acc">›</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
          {entry.mini && (
            <Reveal y={30} className="lg:sticky lg:top-28 lg:self-start">
              <MiniWindow host="gazebo · slam_toolbox" accent={entry.accent} tone="bg" className="h-[260px]">
                <LiveMini kind={entry.mini} />
              </MiniWindow>
            </Reveal>
          )}
        </div>

        {entry.results && (
          <Reveal className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-[1.1fr_1fr_1fr_1fr]">
            {entry.visual === "skidpad" && (
              <div className="grid content-center gap-2 bg-panel p-4">
                <Skidpad className="w-full max-w-[180px]" />
                <span className="font-mono text-[10.5px] text-dim">skidpad · 4th at FS Italy</span>
              </div>
            )}
            {entry.results.map((r, i) => (
              <div key={r.event} className="grid content-start gap-1.5 bg-panel p-4">
                <span className="font-display text-[40px] leading-none font-extrabold tracking-tight text-acc">
                  <Counter value={r.place} suffix={ordinal(r.place)} delay={i * 0.12} />
                </span>
                <span className="text-[14px] font-semibold">{r.event}</span>
                <span className="text-[13px] leading-snug text-fog">{r.note}</span>
              </div>
            ))}
          </Reveal>
        )}

        {entry.awards && (
          <Reveal className="grid gap-2">
            <Label>Awards</Label>
            <ul className="grid">
              {entry.awards.map((a) => (
                <li key={a.title} className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-line py-2.5 last:border-b-0">
                  <span className="text-[15px]">
                    {a.href ? (
                      <a href={a.href} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-acc">
                        {a.title} <span className="text-acc">↗</span>
                      </a>
                    ) : (
                      <span className="font-semibold">{a.title}</span>
                    )}
                    <span className="text-fog"> · {a.detail}</span>
                  </span>
                  <span className="font-mono text-[12px] text-dim">{a.period}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {entry.learned.length > 0 && (
          <Reveal className="grid gap-2">
            <Label>What I learned</Label>
            <ul className="flex flex-wrap gap-2">
              {entry.learned.map((l) => (
                <li key={l} className="rounded-xl border border-line bg-panel px-3.5 py-2 text-[14px] leading-snug">
                  {l}
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {(entry.tags.length > 0 || entry.href) && (
          <Reveal className="flex flex-wrap items-center gap-1.5">
            {entry.tags.map((t) => (
              <span key={t} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11.5px] text-fog">
                {t}
              </span>
            ))}
            {entry.href && (
              <a href={entry.href} target="_blank" rel="noopener noreferrer" className="ml-2 text-[14px] font-semibold text-acc">
                {entry.hrefLabel ?? "Link"} ↗
              </a>
            )}
          </Reveal>
        )}
      </div>
    </article>
  );
}

export function Journey() {
  const rail = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: rail, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <section id="journey" data-sheet="Journey" aria-label="Journey" className="mx-auto max-w-page scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32">
      <div className="mb-16 grid gap-4">
        <RiseText text={DATA.sections.journey.title} className="font-display text-[clamp(2.6rem,6.5vw,5rem)] leading-[0.95] font-extrabold tracking-[-0.05em]" />
        <Reveal>
          <p className="max-w-[52ch] text-[17px] text-fog">{DATA.sections.journey.intro}</p>
        </Reveal>
      </div>

      <div ref={rail} className="relative grid gap-24">
        <span aria-hidden className="absolute top-2 bottom-0 left-2 w-px bg-line md:left-[136px]" />
        <motion.span aria-hidden className="absolute top-2 bottom-0 left-2 w-px origin-top bg-acc md:left-[136px]" style={{ scaleY }} />
        {DATA.journey.map((entry) => (
          <Entry key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
}
