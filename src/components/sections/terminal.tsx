"use client";

import { useToggleTheme } from "@/components/site/theme-toggle";
import { BUILD_LOGS } from "@/data/build-logs";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/*
 * A small shell for people who'd rather type. Everything it prints comes from
 * the data files. Tab completes, ↑/↓ walks history, and chips under it run
 * commands for touch users.
 */

type Line = { kind: "in" | "out" | "err" | "acc"; text: string };

const PROJECTS = [...DATA.projects, ...DATA.moreBuilds];
const COMMANDS = ["help", "whoami", "projects", "log", "open", "journey", "skills", "contact", "resume", "theme", "clear"];
const PROMPT = "guest@divyanshu ~ %";

function run(input: string, ctx: { go: (href: string) => void; theme: () => void }): Line[] | "clear" {
  const [cmd, ...args] = input.trim().split(/\s+/);
  const arg = args.join(" ").toLowerCase();
  const out = (text: string, kind: Line["kind"] = "out"): Line => ({ kind, text });
  switch (cmd?.toLowerCase()) {
    case "":
      return [];
    case "help":
      return [
        out("whoami            who I am, in one line"),
        out("projects          everything I've built"),
        out("log <project>     problems I hit on a project and how I solved them"),
        out("open <project>    open a project's build log"),
        out("journey           where I've been"),
        out("skills            what I use, by area"),
        out("contact           how to reach me (copies my email)"),
        out("resume · theme · clear"),
      ];
    case "whoami":
      return [out(`${DATA.name}. ${DATA.description}`)];
    case "projects":
    case "ls":
      return PROJECTS.map((p) => out(`${p.slug.padEnd(14)} ${p.kind}`));
    case "log": {
      const log = BUILD_LOGS.find((l) => l.slug === arg);
      if (!log) return [out(`usage: log <${PROJECTS.map((p) => p.slug).join("|")}>`, "err")];
      return [
        ...log.steps.map((s, i) => out(`${String(i + 1).padStart(2, "0")}  ${s.title}`)),
        out(`→ open ${log.slug} for the full write-up, code and demos`, "acc"),
      ];
    }
    case "open":
    case "cd": {
      const p = PROJECTS.find((x) => x.slug === arg);
      if (!p) return [out(`no such project: ${arg || "(none)"}. Try: projects`, "err")];
      ctx.go(`/projects/${p.slug}`);
      return [out(`opening ${p.title}…`, "acc")];
    }
    case "journey":
      return DATA.journey.map((j) => out(`${j.when.padEnd(6)} ${j.org} · ${j.roles[0].title}`));
    case "skills":
      return DATA.skills.map((g) => out(`${g.area.padEnd(22)} ${g.items.map((i) => i.name).join(", ")}`));
    case "contact":
    case "email":
      navigator.clipboard?.writeText(DATA.contact.email).catch(() => {});
      return [out(DATA.contact.email, "acc"), out("copied to your clipboard")];
    case "resume":
      window.open(DATA.contact.resume, "_blank");
      return [out("opening résumé…", "acc")];
    case "theme":
      ctx.theme();
      return [out("theme switched")];
    case "clear":
      return "clear";
    case "sudo":
      if (arg === "hire-me" || arg === "hire me") {
        window.location.href = `mailto:${DATA.contact.email}?subject=${encodeURIComponent("Let's talk")}`;
        return [out("permission granted. opening your mail client…", "acc")];
      }
      return [out("nice try.", "err")];
    default:
      return [out(`command not found: ${cmd}. Type help.`, "err")];
  }
}

export function Terminal() {
  const router = useRouter();
  const toggleTheme = useToggleTheme();
  const [lines, setLines] = useState<Line[]>([
    { kind: "out", text: "Last login: just now on ttys001" },
    { kind: "acc", text: "Type help, or try: log vibecraft · whoami · sudo hire-me" },
  ]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const screen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    screen.current?.scrollTo({ top: screen.current.scrollHeight });
  }, [lines]);

  const exec = (cmd: string) => {
    const result = run(cmd, { go: (href) => router.push(href), theme: () => toggleTheme() });
    if (result === "clear") setLines([]);
    else setLines((l): Line[] => [...l, { kind: "in" as const, text: cmd }, ...result].slice(-80));
    if (cmd.trim()) setHistory((h) => [cmd, ...h].slice(0, 30));
    setCursor(-1);
    setValue("");
  };

  const complete = () => {
    const [cmd, ...rest] = value.split(" ");
    if (rest.length === 0) {
      const match = COMMANDS.filter((c) => c.startsWith(cmd));
      if (match.length === 1) setValue(`${match[0]} `);
      else if (match.length > 1) setLines((l) => [...l, { kind: "out", text: match.join("  ") }]);
    } else {
      const part = rest.join(" ");
      const match = PROJECTS.map((p) => p.slug).filter((s) => s.startsWith(part));
      if (match.length === 1) setValue(`${cmd} ${match[0]}`);
      else if (match.length > 1) setLines((l) => [...l, { kind: "out", text: match.join("  ") }]);
    }
  };

  return (
    <div
      data-term-focus={focused}
      className={cn(
        "flex h-[380px] flex-col overflow-hidden rounded-2xl border bg-bg shadow-float transition-colors duration-300",
        focused ? "border-acc/60" : "border-line"
      )}
      onClick={() => input.current?.focus()}
    >
      <div className="flex items-center gap-3 border-b border-line bg-panel-2 px-3 py-2">
        <div className="flex gap-1.5" aria-hidden>
          <i className="block size-2.5 rounded-full bg-acc" />
          <i className="block size-2.5 rounded-full bg-line" />
          <i className="block size-2.5 rounded-full bg-line" />
        </div>
        <span className="font-mono text-[11px] text-dim">~/divyanshu — zsh</span>
      </div>
      <div ref={screen} className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 font-mono text-[12.5px] leading-relaxed" data-lenis-prevent>
        <ol aria-live="polite" className="grid gap-0.5">
          {lines.map((l, i) => (
            <li
              key={i}
              className={cn(
                "break-words whitespace-pre-wrap",
                l.kind === "in" && "text-ink",
                l.kind === "out" && "text-fog",
                l.kind === "err" && "text-bad",
                l.kind === "acc" && "text-acc"
              )}
            >
              {l.kind === "in" && <span className="text-ok">{PROMPT} </span>}
              {l.text}
            </li>
          ))}
        </ol>
        <form
          className="mt-0.5 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            exec(value);
          }}
        >
          <label htmlFor="term-input" className="whitespace-nowrap text-ok">
            {PROMPT}
          </label>
          <input
            id="term-input"
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                e.preventDefault();
                complete();
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                const next = Math.min(history.length - 1, cursor + 1);
                if (history[next]) {
                  setCursor(next);
                  setValue(history[next]);
                }
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                const next = cursor - 1;
                setCursor(Math.max(-1, next));
                setValue(next >= 0 ? history[next] : "");
              }
            }}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-ink caret-[var(--acc)] outline-none"
            aria-label="Terminal command"
          />
        </form>
      </div>
      <div className="flex gap-1.5 overflow-x-auto border-t border-line px-3 py-2">
        {["help", "whoami", "log vibecraft", "projects", "contact"].map((c) => (
          <button
            key={c}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              exec(c);
            }}
            className="rounded-md border border-line px-2 py-1 font-mono text-[11px] whitespace-nowrap text-fog transition-colors hover:border-acc hover:text-ink"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
