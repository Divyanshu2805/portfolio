import { ArchitectureDiagram } from "@/components/build-log/architecture";
import { CodeExcerpt } from "@/components/build-log/code-excerpt";
import { DemoView } from "@/components/build-log/demo";
import { Toc } from "@/components/build-log/toc";
import { LiveMini } from "@/components/minis";
import { MiniWindow } from "@/components/minis/window";
import { Footer } from "@/components/sections/footer";
import { ButtonLink } from "@/components/site/button";
import { Reveal, RiseText } from "@/components/site/motion-text";
import { type BuildStep, getBuildLog } from "@/data/build-logs";
import { DATA } from "@/data/resume";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";

const ALL = [...DATA.projects, ...DATA.moreBuilds];

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL.filter((p) => getBuildLog(p.slug)).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = ALL.find((p) => p.slug === slug);
  if (!project) return {};
  return { title: `${project.title} build log`, description: project.outcome };
}

const UPDATED = new Date().toISOString().slice(0, 10);

function Step({ step, index, total }: { step: BuildStep; index: number; total: number }) {
  const rows = [
    { label: "The problem", text: step.problem, dot: "bg-bad" },
    { label: "What I built", text: step.solution, dot: "bg-acc" },
    { label: "What it cost", text: step.tradeoff, dot: "bg-dim" },
  ];
  return (
    <article id={step.id} className="grid scroll-mt-28 grid-cols-[minmax(0,1fr)] gap-7">
      <Reveal className="grid gap-2">
        <span className="font-mono text-[12px] text-acc">
          Problem {String(index + 1).padStart(2, "0")} of {String(total).padStart(2, "0")}
        </span>
        <h3 className="font-display text-[clamp(1.7rem,3.4vw,2.5rem)] leading-[1.05] font-extrabold tracking-[-0.04em]">{step.title}</h3>
      </Reveal>

      <ol className="relative grid gap-6 pl-7">
        <span aria-hidden className="absolute top-2 bottom-2 left-[5px] w-px bg-line" />
        {rows.map((r, i) => (
          <Reveal as="li" key={r.label} delay={i * 0.08} className="relative grid gap-1.5">
            <span aria-hidden className={`absolute top-[7px] -left-7 size-[11px] rounded-full border-2 border-bg ${r.dot}`} />
            <span className="font-mono text-[11.5px] tracking-wide text-dim">{r.label}</span>
            <p className="max-w-[68ch] text-[16px] leading-relaxed text-fog">{r.text}</p>
          </Reveal>
        ))}
      </ol>

      {step.code && (
        <Reveal>
          <CodeExcerpt {...step.code} />
        </Reveal>
      )}
      {step.demo && (
        <Reveal>
          <DemoView demo={step.demo} />
        </Reveal>
      )}

      <Reveal>
        <blockquote className="m-0 grid gap-2 rounded-2xl border border-acc/40 bg-acc/[0.06] px-5 py-4">
          <span className="font-mono text-[11.5px] tracking-wide text-acc">Takeaway</span>
          <p className="text-[17px] leading-snug font-medium tracking-tight">{step.takeaway}</p>
        </blockquote>
      </Reveal>
    </article>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = ALL.find((p) => p.slug === slug);
  const log = getBuildLog(slug);
  if (!project || !log) notFound();

  const index = ALL.findIndex((p) => p.slug === slug);
  const next = ALL[(index + 1) % ALL.length];
  const toc = [
    { id: "context", label: "Context" },
    { id: "architecture", label: "Architecture" },
    ...log.steps.map((s) => ({ id: s.id, label: s.title })),
    { id: "takeaways", label: "Takeaways" },
  ];

  return (
    <>
      <main id="main" data-accent={project.accent} data-scope={project.accent} data-sheet={project.title} className="pt-28 sm:pt-32">
        <div className="mx-auto max-w-page px-5 sm:px-8">
          <Reveal y={10}>
            <Link
              href={`/#work-${project.slug}`}
              className="group inline-flex items-center gap-2 font-mono text-[12.5px] text-fog transition-colors hover:text-ink"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> All work
            </Link>
          </Reveal>

          <header className="mt-8 grid gap-5">
            <span className="font-mono text-[12.5px] text-acc">{project.kind} · build log</span>
            <ViewTransition name={`title-${project.slug}`} share="morph" default="none">
              <h1 className="font-display text-[clamp(3rem,9vw,7rem)] leading-[0.9] font-extrabold tracking-[-0.055em]">{project.title}</h1>
            </ViewTransition>
            <Reveal delay={0.05}>
              <p className="max-w-[48ch] text-[clamp(1.2rem,2.3vw,1.55rem)] leading-snug tracking-tight">{project.outcome}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <dl className="mt-2 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-[1fr_auto_1.4fr]">
                <div className="grid gap-1 bg-panel px-5 py-4">
                  <dt className="font-mono text-[11px] text-dim">Role</dt>
                  <dd className="text-[14.5px]">{log.role}</dd>
                </div>
                <div className="grid gap-1 bg-panel px-5 py-4">
                  <dt className="font-mono text-[11px] text-dim">When</dt>
                  <dd className="text-[14.5px]">{log.when}</dd>
                </div>
                <div className="grid gap-1.5 bg-panel px-5 py-4">
                  <dt className="font-mono text-[11px] text-dim">Stack</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {project.stack.map((s) => (
                      <span key={s} className="rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-fog">
                        {s}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </Reveal>
            {project.links.length > 0 && (
              <Reveal delay={0.12} className="flex flex-wrap gap-3">
                {project.links.map((l, i) => (
                  <ButtonLink key={l.href} href={l.href} external variant={i === 0 ? "accent" : "ghost"} size="sm">
                    {l.label}
                  </ButtonLink>
                ))}
              </Reveal>
            )}
          </header>

          <ViewTransition name={`mini-${project.slug}`} share="morph" default="none">
            <MiniWindow host={project.host} accent={project.accent} tone="bg" className="mt-12 h-[420px] sm:h-[460px]">
              <LiveMini kind={project.mini} />
            </MiniWindow>
          </ViewTransition>

          <div className="mt-20 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
            <aside className="hidden lg:block">
              <Toc items={toc} />
            </aside>

            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-24">
              <section id="context" className="grid scroll-mt-28 grid-cols-[minmax(0,1fr)] gap-4">
                <RiseText text="Context" className="font-display text-[clamp(2rem,4vw,3rem)] leading-none font-extrabold tracking-[-0.045em]" />
                <Reveal>
                  <p className="max-w-[64ch] text-[18px] leading-relaxed text-fog">{log.context}</p>
                </Reveal>
              </section>

              <section id="architecture" className="grid scroll-mt-28 grid-cols-[minmax(0,1fr)] gap-5">
                <RiseText text="Architecture" className="font-display text-[clamp(2rem,4vw,3rem)] leading-none font-extrabold tracking-[-0.045em]" />
                <Reveal>
                  <p className="max-w-[60ch] text-[15px] text-fog">Point at a component to see what it talks to.</p>
                </Reveal>
                <Reveal>
                  <ArchitectureDiagram arch={log.architecture} label={`${project.title} architecture`} />
                </Reveal>
              </section>

              <section aria-label="Build log" className="grid grid-cols-[minmax(0,1fr)] gap-24">
                {log.steps.map((step, i) => (
                  <Step key={step.id} step={step} index={i} total={log.steps.length} />
                ))}
              </section>

              <section id="takeaways" className="grid scroll-mt-28 grid-cols-[minmax(0,1fr)] gap-5">
                <RiseText text="Takeaways" className="font-display text-[clamp(2rem,4vw,3rem)] leading-none font-extrabold tracking-[-0.045em]" />
                <ul className="grid gap-3">
                  {log.takeaways.map((t, i) => (
                    <Reveal as="li" key={t} delay={i * 0.06} className="flex gap-4 rounded-2xl border border-line bg-panel px-5 py-4">
                      <span className="font-mono text-[12px] text-acc">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[16px] leading-relaxed">{t}</span>
                    </Reveal>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          <Link
            href={`/projects/${next.slug}`}
            data-scope={next.accent}
            className="group mt-32 mb-24 grid gap-3 overflow-hidden rounded-3xl border border-line bg-panel p-7 transition-[border-color,transform] duration-500 ease-out-expo hover:-translate-y-1 hover:border-acc/60 sm:p-10"
          >
            <span className="font-mono text-[12px] text-dim">Next build log</span>
            <span className="flex items-end justify-between gap-6">
              <span className="font-display text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.9] font-extrabold tracking-[-0.05em] transition-colors duration-500 group-hover:text-acc">
                {next.title}
              </span>
              <span className="grid size-14 flex-none place-items-center rounded-2xl bg-acc text-2xl text-bg transition-transform duration-500 ease-out-expo group-hover:translate-x-1 group-hover:-rotate-12">
                →
              </span>
            </span>
            <span className="max-w-[52ch] text-[15px] text-fog">{next.outcome}</span>
          </Link>
        </div>
      </main>
      <Footer updated={UPDATED} />
    </>
  );
}
