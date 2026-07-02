"use client";

import { DATA } from "@/data/resume";
import { useLive } from "@/hooks/use-live";
import { useRef } from "react";

/**
 * The page ends on a race car that writes my name behind it as it drives
 * through, then comes back and collects it, in the current accent.
 * Loops only while on screen; reduced motion shows the name, lit and still.
 */
export function Footer({ updated }: { updated: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const live = useLive(ref, 0.6);
  const word = DATA.firstName.toLowerCase();

  return (
    <footer className="overflow-hidden border-t border-line pt-10 pb-8">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4 px-5 font-mono text-[12px] text-dim sm:px-8">
        <span>© {new Date(updated).getUTCFullYear()} {DATA.name}</span>
        <span className="flex flex-wrap gap-x-5 gap-y-1">
          <span>Updated {updated}</span>
          {DATA.footer.sourceUrl && (
            <a href={DATA.footer.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              Source ↗
            </a>
          )}
        </span>
      </div>
      <div
        ref={ref}
        aria-hidden
        data-live={live}
        className="wordmark mt-8 font-display text-[clamp(4rem,19vw,17rem)] leading-[0.8] font-extrabold tracking-[-0.035em] select-none"
      >
        <div className="relative mx-auto w-fit">
          <Name word={word} className="wordmark-hold" />
          <div className="wordmark-rig absolute inset-0">
            {/* Windows ride with the car; the name inside counter-moves so it stays put. */}
            <div className="wordmark-win" style={{ right: "calc(100% + 2.3em)" }}>
              <div className="wordmark-counter" style={{ left: "calc(200vw + 2.3em)" }}>
                <p className="wordmark-line">{word}</p>
              </div>
            </div>
            <div className="wordmark-win" style={{ right: "calc(100% + 3.5em)" }}>
              <div className="wordmark-counter" style={{ left: "calc(200vw + 3.5em)" }}>
                <p className="wordmark-line wordmark-fill">{word}</p>
              </div>
            </div>
            <div className="wordmark-win wordmark-win-b" style={{ left: 0 }}>
              <div className="wordmark-counter" style={{ left: 0 }}>
                <Name word={word} />
              </div>
            </div>
            <Car />
          </div>
        </div>
      </div>
    </footer>
  );
}

function Name({ word, className }: { word: string; className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <p className="wordmark-line">{word}</p>
      <p className="wordmark-line wordmark-fill absolute inset-0">{word}</p>
    </div>
  );
}

/**
 * Team Fateh's car in side view, drawn from the team's render (mirrored to
 * drive right) and outlined like the letters: tall rear wing with the swoosh,
 * exposed frame, roll hoop and backstay, sidepod with the team name, sweeping nose with its
 * stripe, low front wing, thick tyres on small rims.
 */
const TEAM = DATA.journey.find((j) => j.id === "fateh")?.org.toUpperCase();

function Car() {
  const wheels = [60, 222];
  return (
    <svg className="wordmark-car" viewBox="0 0 320 120" fill="none" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round">
      {/* suspension arms and frame, behind the wheels */}
      <path d="M60 90l36-8M60 90l36 10M222 90l-30-8M222 90l-30 10" />
      <path d="M86 66l14 32M100 64l-14 34M112 62l-12 36" />
      {/* rear wing: struts, endplate with a curved leading edge, swoosh, elements */}
      <path d="M46 60l40 8M66 60l24 6" />
      <path className="wordmark-body" d="M8 8h52q10 0 9 9c-2 18 6 33 22 41q4 3-2 3H14q-6 0-6-6Z" />
      <path className="wordmark-stripe" d="M61 14c-3 18 4 33 19 42" />
      <path d="M14 30c14-4 28-5 42-3" />
      {/* body: engine cover, cockpit, sweeping nose, floor */}
      <path
        className="wordmark-body"
        d="M84 68c14-4 34-6 50-6l16-2c16-2 34-4 50-4c40 0 74 16 104 34q5 4-1 6c-8 2-16 4-24 5H104q-14 0-20-10Z"
      />
      <path className="wordmark-stripe" d="M298 90c-28-18-60-28-96-30l-34 2" />
      {/* roll hoop with its backstay, driver */}
      <path d="M150 60l-10-32q-2-5 3-5h4q4 0 4 4l4 33M142 26l-44 40" />
      <circle className="wordmark-body" cx="172" cy="46" r="11" />
      <path d="M164 44q8-3 16 0" />
      {/* sidepod with the team name */}
      <path d="M112 76h80q8 0 10 8l4 18H112Z" />
      <text x="153" y="93" className="wordmark-num" fontSize="8" fontWeight="600" textAnchor="middle">
        {TEAM}
      </text>
      {/* front wing: main plane, flap, endplate */}
      <path className="wordmark-body" d="M252 106c20-3 42-3 64 0v6h-64Z" />
      <path d="M262 100c16-2 32-2 48 0" />
      <path d="M302 98h12v16h-12" />
      {wheels.map((cx) => (
        <g key={cx}>
          <circle className="wordmark-tyre" cx={cx} cy={90} r={28} />
          <circle className="wordmark-rim" cx={cx} cy={90} r={16} />
          <g className="wordmark-spin">
            {[0, 72, 144, 216, 288].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return <path key={deg} d={`M${cx} 90l${(Math.cos(rad) * 13).toFixed(2)} ${(Math.sin(rad) * 13).toFixed(2)}`} />;
            })}
            <circle cx={cx} cy={90} r={3.5} />
          </g>
        </g>
      ))}
    </svg>
  );
}
