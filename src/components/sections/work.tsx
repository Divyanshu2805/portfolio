"use client";

import { BuildLogPreview } from "@/components/build-log/preview";
import { LiveMini } from "@/components/minis";
import { MiniWindow } from "@/components/minis/window";
import { Counter, Reveal, RiseText } from "@/components/site/motion-text";
import { DATA, type Project } from "@/data/resume";
import { scrollToHash } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import { type MotionValue, motion, useMotionValueEvent, useScroll } from "motion/react";
import { createRef, type RefObject, useMemo, useState, ViewTransition } from "react";

/** Mono label with a dot in the chapter's accent. */
export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-mono text-[12px] tracking-wide text-fog", className)}>
      <i aria-hidden className="block size-1.5 rounded-full bg-acc" />
      {children}
    </span>
  );
}

export function ProjectLinks({ links }: { links: Project["links"] }) {
  if (!links.length) return null;
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1 text-[15px] font-semibold text-acc"
        >
          <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out-expo group-hover:bg-[length:100%_1px]">
            {l.label}
          </span>
          <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
        </a>
      ))}
    </div>
  );
}

function IndexItem({
  project,
  target,
  active,
  onActive,
}: {
  project: Project;
  target: RefObject<HTMLElement | null>;
  active: boolean;
  onActive: () => void;
}) {
  const { scrollYProgress } = useScroll({ target, offset: ["start center", "end center"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0 && v < 1) onActive();
  });
  return (
    <li data-scope={project.accent}>
      <button
        type="button"
        onClick={() => scrollToHash(`#work-${project.slug}`)}
        className="group grid w-full grid-cols-[3px_1fr] gap-4 py-3 text-left"
        aria-current={active ? "true" : undefined}
      >
        <Track progress={scrollYProgress} />
        <span className="grid gap-0.5">
          <span
            className={cn(
              "font-display text-[26px] leading-tight font-bold tracking-[-0.03em] transition-colors duration-500",
              active ? "text-acc" : "text-dim group-hover:text-fog"
            )}
          >
            {project.title}
          </span>
          <span className={cn("text-[13px] transition-colors duration-500", active ? "text-fog" : "text-dim")}>{project.kind}</span>
        </span>
      </button>
    </li>
  );
}

function Track({ progress }: { progress: MotionValue<number> }) {
  return (
    <span aria-hidden className="relative block overflow-hidden rounded-full bg-line">
      <motion.span className="absolute inset-0 origin-top rounded-full bg-acc" style={{ scaleY: progress }} />
    </span>
  );
}

function Chapter({ project, target }: { project: Project; target: RefObject<HTMLElement | null> }) {
  return (
    <article ref={target} id={`work-${project.slug}`} data-accent={project.accent} className="scroll-mt-24">
      <div className="mb-5 grid gap-2">
        <Label>{project.kind}</Label>
        <ViewTransition name={`title-${project.slug}`} share="morph" default="none">
          <RiseText as="h3" text={project.title} className="font-display text-[clamp(2.4rem,5vw,3.6rem)] leading-none font-extrabold tracking-[-0.045em]" />
        </ViewTransition>
      </div>

      <Reveal y={40}>
        <ViewTransition name={`mini-${project.slug}`} share="morph" default="none">
          <MiniWindow host={project.host} accent={project.accent} tone="bg" className="h-[400px] sm:h-[420px]">
            <LiveMini kind={project.mini} />
          </MiniWindow>
        </ViewTransition>
      </Reveal>

      <Reveal className="mt-8" delay={0.05}>
        <p className="max-w-[46ch] text-[clamp(1.2rem,2.2vw,1.5rem)] leading-snug tracking-tight">{project.outcome}</p>
      </Reveal>

      <Reveal className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3" delay={0.05}>
        {project.impact.map((s, i) => (
          <div key={s.label} className={cn("grid content-start gap-1 bg-panel p-4", i === 2 && "col-span-2 sm:col-span-1")}>
            <span className="font-display text-[30px] leading-none font-bold tracking-tight text-acc">
              <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} delay={i * 0.1} />
            </span>
            <span className="text-[13px] leading-snug text-fog">{s.label}</span>
          </div>
        ))}
      </Reveal>

      <div className="mt-8 grid gap-8 md:grid-cols-[1.35fr_1fr]">
        <Reveal className="grid content-start gap-3">
          <Label>What I built</Label>
          <ul className="grid gap-2.5 text-[15px] leading-relaxed text-fog">
            {project.built.map((b) => (
              <li key={b} className="grid grid-cols-[14px_1fr]">
                <span aria-hidden className="text-acc">›</span>
                {b}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal className="grid content-start gap-3" delay={0.08}>
          <Label>What I learned</Label>
          <ul className="grid gap-3">
            {project.learned.map((l) => (
              <li key={l} className="rounded-xl border border-line bg-panel px-4 py-3 text-[15px] leading-relaxed">
                {l}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="mt-10">
        <BuildLogPreview slug={project.slug} />
      </div>

      <Reveal className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-line pt-5">
        <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
          {project.stack.map((s) => (
            <li key={s} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11.5px] text-fog">
              {s}
            </li>
          ))}
        </ul>
        <ProjectLinks links={project.links} />
      </Reveal>
    </article>
  );
}

export function Work() {
  const projects = DATA.projects;
  const refs = useMemo(() => projects.map(() => createRef<HTMLElement>()), [projects]);
  const [active, setActive] = useState(0);

  return (
    <section id="work" data-sheet="Selected work" aria-label={DATA.sections.work.title} className="mx-auto max-w-page scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32">
      <div className="mb-16 grid gap-4 lg:mb-20">
        <RiseText
          text={DATA.sections.work.title}
          className="font-display text-[clamp(2.6rem,6.5vw,5rem)] leading-[0.95] font-extrabold tracking-[-0.05em]"
        />
        <Reveal>
          <p className="max-w-[52ch] text-[17px] text-fog">{DATA.sections.work.intro}</p>
        </Reveal>
      </div>

      <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-16">
        <aside className="hidden lg:block" aria-label="Projects">
          <ol className="sticky top-28 grid gap-1">
            {projects.map((p, i) => (
              <IndexItem key={p.slug} project={p} target={refs[i]} active={active === i} onActive={() => setActive(i)} />
            ))}
          </ol>
        </aside>
        <div className="grid gap-32">
          {projects.map((p, i) => (
            <Chapter key={p.slug} project={p} target={refs[i]} />
          ))}
        </div>
      </div>
    </section>
  );
}
