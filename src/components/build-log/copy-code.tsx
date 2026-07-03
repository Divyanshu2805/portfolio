"use client";

import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

export function CopyCode({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable: nothing to do */
        }
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] transition-colors",
        copied ? "text-ok" : "text-dim hover:bg-panel hover:text-ink"
      )}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
