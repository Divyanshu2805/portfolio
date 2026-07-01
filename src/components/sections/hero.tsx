"use client";

import { LiveMini } from "@/components/minis";
import { MiniWindow } from "@/components/minis/window";
import { CircuitField } from "@/components/backgrounds/circuit-field";
import { ButtonLink } from "@/components/site/button";
import { Counter } from "@/components/site/motion-text";
import { type Accent, DATA } from "@/data/resume";
import { useMedia, useReducedMotion } from "@/hooks/use-live";
import { scrollToHash } from "@/lib/scroll";

import { useEffect, useRef, useState } from "react";

const { hero, projects } = DATA;
const HAND = projects.slice(0, 3);

/** "I build ___": deletes and retypes through what I build, each in its product's colour. */
function useTypedWords(words: { text: string; accent: Accent }[]) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(words[0].text);

  useEffect(() => {
    if (reduced) return;
    let timer: ReturnType<typeof setTimeout>;
    let i = 0;
    let chars = words[0].text.length;
    let deleting = true;
    const step = () => {
      const word = words[i].text;
      if (deleting) {
        chars--;
        setText(word.slice(0, chars));
        if (chars === 0) {
          deleting = false;
          i = (i + 1) % words.length;
          setIndex(i);
        }
        timer = setTimeout(step, 28);
      } else {
        chars++;
        setText(words[i].text.slice(0, chars));
        if (chars === words[i].text.length) {
          deleting = true;
          timer = setTimeout(step, 2300);
        } else timer = setTimeout(step, 62);
      }
    };
    timer = setTimeout(step, 2600);
    return () => clearTimeout(timer);
  }, [reduced, words]);

  return { text, accent: words[index].accent };
}

/** Three product windows, dealt like a hand. The front one plays; they rotate every few seconds. */
function WindowStack() {
  const reduced = useReducedMotion();
  const fine = useMedia("(hover: hover) and (pointer: fine)");
  const [front, setFront] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (reduced || held) return;
    const id = setInterval(() => setFront((f) => (f + 1) % HAND.length), 5200);
    return () => clearInterval(id);
  }, [reduced, held]);

  return (
    <div
      className="stack deal-in relative aspect-[4/3.4] w-full max-w-[520px] justify-self-center lg:justify-self-end"
      style={{ "--d": "600ms" } as React.CSSProperties}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
    >
      {HAND.map((p, i) => {
        const pos = (i - front + HAND.length) % HAND.length;
        return (
          <div key={p.slug} data-pos={pos} className="stack-win absolute inset-x-0 top-0 h-[84%]">
            <MiniWindow host={p.host} accent={p.accent} className="h-full">
              <LiveMini kind={p.mini} compact playing={pos === 0 || (fine && held)} />
            </MiniWindow>
            <button
              type="button"
              onClick={() => scrollToHash(`#work-${p.slug}`)}
              onFocus={() => setFront(i)}
              className="absolute inset-0 cursor-pointer rounded-xl"
              aria-label={`${p.title}, ${p.kind}. Go to project`}
            />
          </div>
        );
      })}
    </div>
  );
}

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const { text, accent } = useTypedWords(hero.words);
  const [first, last] = DATA.name.split(" ");

  const splitLine = (word: string, offset: number) =>
    [...word].map((ch, i) => (
      <span key={i} className="rise-ch" style={{ "--i": offset + i, "--d": "80ms" } as React.CSSProperties}>
        {ch}
      </span>
    ));

  return (
    <section
      id="top"
      ref={section}
      data-accent="ion"
      data-sheet="Index"
      className="relative isolate overflow-x-clip pt-28 pb-16 sm:pt-36 lg:pb-20"
    >
      <div
        data-scope={accent}
        className="absolute inset-0 -z-10 [mask-image:radial-gradient(60%_75%_at_82%_42%,#000_25%,transparent_72%)] max-lg:[mask-image:linear-gradient(to_bottom,transparent_20%,#000_60%,transparent)]"
      >
        <CircuitField className="size-full" />
      </div>

      <div className="mx-auto grid max-w-page items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-8">
        <div data-scope={accent}>
          <p className="fade-up inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 font-mono text-[12px] text-fog">
            <i className="ping block size-[7px] rounded-full bg-ok" />
            {hero.status}
          </p>

          <h1 className="mt-6 font-display text-[clamp(3.4rem,11vw,8.6rem)] leading-[0.86] font-extrabold tracking-[-0.055em]" aria-label={DATA.name}>
            <span aria-hidden className="rise-mask">{splitLine(first, 0)}</span>
            <span aria-hidden className="rise-mask">{splitLine(last, first.length)}</span>
          </h1>

          <p
            className="fade-up mt-7 max-w-[34ch] text-[clamp(1.15rem,2.2vw,1.45rem)] leading-snug tracking-tight text-fog"
            style={{ "--d": "450ms" } as React.CSSProperties}
          >
            {hero.lead}{" "}
            <span className="font-semibold whitespace-nowrap text-acc">
              {text}
              <span aria-hidden className="caret" />
            </span>
            <br />
            {hero.tail}
          </p>

          <div className="fade-up mt-8 flex flex-wrap gap-3" style={{ "--d": "560ms" } as React.CSSProperties}>
            <ButtonLink href="#work" icon="down">
              See the work
            </ButtonLink>
            <ButtonLink href="#contact" variant="ghost" icon="mail">
              Get in touch
            </ButtonLink>
          </div>
        </div>

        <WindowStack />
      </div>

      <div className="mx-auto mt-16 max-w-page px-5 sm:px-8 lg:mt-20">
      <dl
        className="fade-up grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4"
        style={{ "--d": "850ms" } as React.CSSProperties}
      >
        {hero.proof.map((s, i) => (
          <div key={s.label} className="group flex flex-col-reverse gap-1 bg-panel px-5 py-4 transition-colors duration-300 hover:bg-panel-2">
            <dt className="text-[13px] leading-snug text-fog">{s.label}</dt>
            <dd className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-none font-bold tracking-tight transition-[color,transform] duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:text-acc">
              <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} delay={0.9 + i * 0.08} />
            </dd>
          </div>
        ))}
      </dl>
      <div className="fade-up mt-10 hidden items-center gap-3 font-mono text-[11px] tracking-wide text-dim sm:flex" style={{ "--d": "1100ms" } as React.CSSProperties}>
        <span className="relative block h-8 w-px overflow-hidden bg-line">
          <span className="scroll-cue absolute inset-0 bg-acc" />
        </span>
        Scroll, or press ⌘K / Ctrl K to jump anywhere
      </div>
      </div>
    </section>
  );
}
