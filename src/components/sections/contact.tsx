"use client";

import { ScopeTrace } from "@/components/backgrounds/scope-trace";
import { Button, ButtonLink } from "@/components/site/button";
import { Reveal, RiseText } from "@/components/site/motion-text";
import { Terminal } from "./terminal";
import { DATA } from "@/data/resume";
import { useEffect, useState } from "react";

const { contact } = DATA;

/** My local time, ticking, so people know when to expect a reply. */
function LocalTime() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: contact.timeZone });
    const tick = () => setTime(fmt.format(new Date()));
    const first = requestAnimationFrame(tick);
    const id = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(first);
      clearInterval(id);
    };
  }, []);
  return (
    <span className="font-mono text-[13px] text-fog tabular-nums">
      {time ?? "--:--:--"} · {contact.timeZoneLabel}
    </span>
  );
}

export function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${contact.email}`;
    }
  };

  return (
    <section id="contact" data-accent="ion" data-sheet="Contact" aria-label="Contact" className="scroll-mt-24 py-24 lg:py-32">
      <ScopeTrace className="mb-16" />
      <div className="mx-auto grid max-w-page items-start gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div className="grid gap-8">
          <RiseText
            text={contact.line}
            className="max-w-[14ch] font-display text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.92] font-extrabold tracking-[-0.055em]"
          />
          <Reveal>
            <p className="max-w-[46ch] text-[18px] leading-relaxed text-fog">{contact.sentence}</p>
          </Reveal>

          <Reveal delay={0.08} className="flex flex-wrap items-center gap-3">
            <ButtonLink href={`mailto:${contact.email}`} variant="accent" icon="mail">
              Email me
            </ButtonLink>
            <Button variant="ghost" icon="copy" onClick={copy} aria-label={copied ? "Email address copied" : `Copy ${contact.email}`}>
              {copied ? "Copied ✓" : contact.email}
            </Button>
          </Reveal>

          <Reveal delay={0.12} className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6">
            <LocalTime />
            <span className="flex flex-wrap gap-x-5 gap-y-2">
              {[...contact.social, { label: "Résumé", href: contact.resume }].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 text-[15px] font-semibold text-fog transition-colors hover:text-acc"
                >
                  {l.label}
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                </a>
              ))}
            </span>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="grid gap-2">
          <span className="font-mono text-[12px] text-dim">Or ask my terminal</span>
          <Terminal />
        </Reveal>
      </div>
    </section>
  );
}
