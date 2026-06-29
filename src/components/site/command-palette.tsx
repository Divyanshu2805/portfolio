"use client";

import { DATA } from "@/data/resume";
import { scrollToHash } from "@/lib/scroll";
import { Command } from "cmdk";
import { ArrowUpRightIcon, CopyIcon, FileTextIcon, HashIcon, MoonIcon } from "lucide-react";
import { BUILD_LOGS } from "@/data/build-logs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToggleTheme } from "./theme-toggle";

const SECTIONS = [
  { hash: "#top", label: "Home" },
  { hash: "#work", label: "Selected work" },
  { hash: "#more", label: "More builds" },
  { hash: "#proveout", label: "Proveout, what I'm building now" },
  { hash: "#journey", label: "Journey" },
  { hash: "#skills", label: "Skills" },
  { hash: "#contact", label: "Contact" },
];

const itemClass =
  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] text-fog transition-colors data-[selected=true]:text-ink";

/** ⌘K / Ctrl K: jump anywhere, copy the email, switch theme, open profiles. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const toggleTheme = useToggleTheme();
  const router = useRouter();
  const pathname = usePathname();
  /** Scroll on the home page; from a case study, navigate home to the section. */
  const goTo = (hash: string) => (pathname === "/" ? scrollToHash(hash) : router.push(`/${hash}`));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", onOpen);
    };
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    // Let the dialog close before scrolling so focus returns cleanly.
    requestAnimationFrame(fn);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(DATA.contact.email);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 900);
    } catch {
      window.location.href = `mailto:${DATA.contact.email}`;
    }
  };

  const projects = [...DATA.projects, ...DATA.moreBuilds];
  const links = [
    ...DATA.contact.social,
    ...projects.flatMap((p) => p.links.filter((l) => l.label === "Live demo").map((l) => ({ label: `${p.title} live demo`, href: l.href }))),
  ];

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command menu"
      loop
      overlayClassName="fixed inset-0 z-[60] bg-bg/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0"
      contentClassName="fixed inset-x-4 top-[14vh] z-[61] mx-auto max-w-[560px] overflow-hidden rounded-2xl border border-line bg-panel shadow-float data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2"
    >
      <Command.Input
        placeholder="Jump to, copy, open…"
        className="w-full border-b border-line bg-transparent px-5 py-4 text-[16px] text-ink outline-none placeholder:text-dim"
      />
      <Command.List className="max-h-[min(420px,60vh)] overflow-y-auto overscroll-contain p-2" data-lenis-prevent>
        <Command.Empty className="px-3 py-6 text-center text-[14px] text-dim">Nothing matches that.</Command.Empty>

        <Command.Group heading="Go to">
          {SECTIONS.map((s) => (
            <Command.Item key={s.hash} value={s.label} onSelect={() => run(() => goTo(s.hash))} className={itemClass}>
              <HashIcon className="size-4 text-dim" />
              {s.label}
            </Command.Item>
          ))}
          {projects.map((p) => (
            <Command.Item
              key={p.slug}
              value={`${p.title} ${p.kind}`}
              onSelect={() => run(() => goTo(`#work-${p.slug}`))}
              className={itemClass}
            >
              <span className="size-2 rounded-full" style={{ background: `var(--c-${p.accent})` }} />
              {p.title}
              <span className="ml-auto truncate font-mono text-[11px] text-dim">{p.kind}</span>
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Build logs · problems I solved">
          {BUILD_LOGS.flatMap((log) => {
            const p = projects.find((x) => x.slug === log.slug);
            return [
              <Command.Item
                key={log.slug}
                value={`${p?.title} build log case study`}
                onSelect={() => run(() => router.push(`/projects/${log.slug}`))}
                className={itemClass}
              >
                <FileTextIcon className="size-4 text-dim" />
                {p?.title} build log
                <span className="ml-auto font-mono text-[11px] text-dim">{log.steps.length} problems</span>
              </Command.Item>,
              ...log.steps.map((step) => (
                <Command.Item
                  key={`${log.slug}-${step.id}`}
                  value={`${p?.title} ${step.title}`}
                  onSelect={() => run(() => router.push(`/projects/${log.slug}#${step.id}`))}
                  className={`${itemClass} pl-10`}
                >
                  <span className="truncate">{step.title}</span>
                  <span className="ml-auto font-mono text-[11px] text-dim">{p?.title}</span>
                </Command.Item>
              )),
            ];
          })}
        </Command.Group>

        <Command.Group heading="Actions">
          <Command.Item value="copy email address" onSelect={copyEmail} className={itemClass}>
            <CopyIcon className="size-4 text-dim" />
            {copied ? "Copied to clipboard" : "Copy email address"}
            <span className="ml-auto font-mono text-[11px] text-dim">{DATA.contact.email}</span>
          </Command.Item>
          <Command.Item value="toggle theme dark light" onSelect={() => run(() => toggleTheme())} className={itemClass}>
            <MoonIcon className="size-4 text-dim" />
            Switch theme
          </Command.Item>
          <Command.Item value="resume cv pdf" onSelect={() => run(() => window.open(DATA.contact.resume, "_blank"))} className={itemClass}>
            <FileTextIcon className="size-4 text-dim" />
            Open résumé
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Links">
          {links.map((l) => (
            <Command.Item
              key={l.href}
              value={l.label}
              onSelect={() => run(() => window.open(l.href, "_blank", "noopener"))}
              className={itemClass}
            >
              <ArrowUpRightIcon className="size-4 text-dim" />
              {l.label}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
      <div className="flex gap-4 border-t border-line px-4 py-2 font-mono text-[11px] text-dim">
        <span>↑↓ move</span>
        <span>↵ open</span>
        <span>esc close</span>
      </div>
    </Command.Dialog>
  );
}
