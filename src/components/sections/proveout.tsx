"use client";

import { LiveMini } from "@/components/minis";
import { MiniWindow } from "@/components/minis/window";
import { DiffRain } from "@/components/backgrounds/misc";
import { ButtonLink } from "@/components/site/button";
import { Reveal, RiseText } from "@/components/site/motion-text";
import { DATA } from "@/data/resume";
import { useLive, useReducedMotion } from "@/hooks/use-live";

import { useEffect, useRef, useState } from "react";
import { Label } from "./work";

const { proveout } = DATA;

/** "status: …" line that types through what's happening now. */
function StatusLine() {
  const ref = useRef<HTMLParagraphElement>(null);
  const live = useLive(ref);
  const reduced = useReducedMotion();
  const [line, setLine] = useState({ i: 0, n: proveout.status[0].length });

  useEffect(() => {
    if (!live || reduced) return;
    let timer: ReturnType<typeof setTimeout>;
    const step = (i: number, n: number, deleting: boolean) => {
      const full = proveout.status[i];
      if (deleting) {
        if (n === 0) return step((i + 1) % proveout.status.length, 0, false);
        setLine({ i, n: n - 1 });
        timer = setTimeout(() => step(i, n - 1, true), 22);
      } else if (n < full.length) {
        setLine({ i, n: n + 1 });
        timer = setTimeout(() => step(i, n + 1, false), 48);
      } else {
        timer = setTimeout(() => step(i, n, true), 2200);
      }
    };
    timer = setTimeout(() => step(line.i, line.n, true), 1800);
    return () => clearTimeout(timer);
    // Restart only when visibility changes; `line` is the resume point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, reduced]);

  return (
    <p ref={ref} className="font-mono text-[13px] text-fog" aria-label={`Status: ${proveout.status.join(", ")}`}>
      <span aria-hidden>
        <span className="text-acc">status</span> <span className="text-dim">→</span> {proveout.status[line.i].slice(0, line.n)}
        <span className="caret text-acc" />
      </span>
    </p>
  );
}

export function Proveout() {
  const mail = `mailto:${DATA.contact.email}?subject=${encodeURIComponent("Proveout early access")}`;
  return (
    <section id="proveout" data-accent="ion" data-sheet="Now building" aria-label="What I'm building now" className="scroll-mt-24 px-3 sm:px-5">
      <div
        data-scope="ion"
        className="dark relative isolate mx-auto max-w-[80rem] overflow-hidden rounded-[28px] border border-line bg-bg px-5 py-16 text-ink sm:px-10 lg:px-14 lg:py-24"
      >
        <DiffRain />

        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-6">
            <Label>Now building · {proveout.role}</Label>
            <RiseText
              text={proveout.name}
              className="font-display text-[clamp(3rem,8vw,6rem)] leading-[0.9] font-extrabold tracking-[-0.055em]"
            />
            <Reveal>
              <p className="max-w-[30ch] text-[clamp(1.25rem,2.4vw,1.6rem)] leading-snug tracking-tight">{proveout.oneLine}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="max-w-[48ch] text-[16px] leading-relaxed text-fog">{proveout.problem}</p>
            </Reveal>
            <StatusLine />
            <Reveal delay={0.12} className="flex flex-wrap gap-3">
              <ButtonLink href={mail} variant="accent" icon="mail">
                Ask for early access
              </ButtonLink>
              {proveout.href && (
                <ButtonLink href={proveout.href} variant="ghost" external>
                  Visit Proveout
                </ButtonLink>
              )}
            </Reveal>
          </div>

          <Reveal y={40}>
            <MiniWindow host="proveout · pull request" accent="ion" className="h-[330px]">
              <LiveMini kind="proveout" />
            </MiniWindow>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
