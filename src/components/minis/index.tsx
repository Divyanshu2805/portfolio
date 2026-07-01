"use client";

import type { MiniKey } from "@/data/resume";
import { useLive } from "@/hooks/use-live";
import { type ComponentType, useRef } from "react";
import { BitBinMini } from "./bitbin";
import { DaqMini } from "./daq";
import { PayFloMini } from "./payflo";
import { ProveoutMini } from "./proveout";
import { SlamMini } from "./slam";
import { TeleMetrixMini } from "./telemetrix";
import { ThaparGenieMini } from "./thapargenie";
import type { MiniProps } from "./types";
import { VibeCraftMini } from "./vibecraft";

const MINIS: Record<MiniKey, ComponentType<MiniProps>> = {
  vibecraft: VibeCraftMini,
  bitbin: BitBinMini,
  thapargenie: ThaparGenieMini,
  payflo: PayFloMini,
  telemetrix: TeleMetrixMini,
  daq: DaqMini,
  proveout: ProveoutMini,
  slam: SlamMini,
};

/**
 * Renders a product miniature that plays only while on screen (and, when
 * `playing` is given, only while that is also true, e.g. on hover).
 */
export function LiveMini({ kind, compact, playing = true }: { kind: MiniKey; compact?: boolean; playing?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const live = useLive(ref);
  const Mini = MINIS[kind];
  return (
    <div ref={ref} className="h-full">
      <Mini active={live && playing} compact={compact} />
    </div>
  );
}
