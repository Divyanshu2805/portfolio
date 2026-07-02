"use client";

import { LiveMini } from "@/components/minis";
import { MiniWindow } from "@/components/minis/window";
import { ButtonLink } from "@/components/site/button";
import { Reveal, RiseText } from "@/components/site/motion-text";
import { DATA, type Project } from "@/data/resume";
import { useMedia } from "@/hooks/use-live";
import { useState, ViewTransition } from "react";
import { Label, ProjectLinks } from "./work";

/** On a mouse the miniature plays while you hover; on touch it plays while on screen. */
function BuildCard({ project, index }: { project: Project; index: number }) {
  const fine = useMedia("(hover: hover) and (pointer: fine)");
  const [hover, setHover] = useState(false);
  return (
    <Reveal as="article" delay={index * 0.08} className="h-full">
      <div
        id={`work-${project.slug}`}
        data-scope={project.accent}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        className="group flex h-full scroll-mt-24 flex-col gap-5 rounded-2xl border border-line bg-panel p-4 transition-[transform,border-color,box-shadow] duration-500 ease-out-expo hover:-translate-y-1 hover:border-acc/50 hover:shadow-float"
      >
        <ViewTransition name={`mini-${project.slug}`} share="morph" default="none">
          <MiniWindow host={project.host} accent={project.accent} tone="bg" className="h-[200px] shadow-none">
            <LiveMini kind={project.mini} playing={!fine || hover} />
          </MiniWindow>
        </ViewTransition>
        <div className="grid gap-2 px-1">
          <Label>{project.kind}</Label>
          <ViewTransition name={`title-${project.slug}`} share="morph" default="none">
            <h3 className="font-display text-[26px] leading-tight font-bold tracking-[-0.03em]">{project.title}</h3>
          </ViewTransition>
          <p className="text-[15px] leading-relaxed text-fog">{project.outcome}</p>
        </div>
        <ul className="grid gap-1.5 px-1 text-[14px] leading-relaxed text-fog">
          {project.built.map((b) => (
            <li key={b} className="grid grid-cols-[14px_1fr]">
              <span aria-hidden className="text-acc">›</span>
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-auto grid gap-4 border-t border-line px-1 pt-4">
          <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
            {project.stack.map((s) => (
              <li key={s} className="rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-fog">
                {s}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ProjectLinks links={project.links} />
            <ButtonLink href={`/projects/${project.slug}`} variant="ghost" size="sm">
              Build log
            </ButtonLink>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function MoreBuilds() {
  return (
    <section id="more" data-sheet="More builds" aria-label={DATA.sections.more.title} className="mx-auto max-w-page scroll-mt-24 px-5 pb-24 sm:px-8 lg:pb-32">
      <div className="mb-10 grid gap-3">
        <RiseText
          text={DATA.sections.more.title}
          className="font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-none font-extrabold tracking-[-0.045em]"
        />
        <Reveal>
          <p className="max-w-[52ch] text-[16px] text-fog">{DATA.sections.more.intro}</p>
        </Reveal>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {DATA.moreBuilds.map((p, i) => (
          <BuildCard key={p.slug} project={p} index={i} />
        ))}
      </div>
    </section>
  );
}
