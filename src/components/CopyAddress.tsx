"use client";

import { useState } from "react";

export default function CopyAddress({ address }: { address: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const label = (
    <span className="block font-narrow text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Contract address</span>
  );
  if (!address) {
    return (
      <div className="w-full max-w-[520px] border-[3px] border-dashed border-cream/50 bg-ink/70 px-3 py-2.5">
        {label}
        <span className="font-mono text-sm text-cream/70">Drops at launch</span>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(address);
          setState("copied");
        } catch {
          setState("failed");
        }
        setTimeout(() => setState("idle"), 1800);
      }}
      className="group flex w-full max-w-[520px] items-center gap-3 border-[3px] border-cream bg-ink px-3 py-2.5 text-left shadow-brutal-sm transition hover:border-gold"
    >
      <span className="min-w-0 flex-1">
        {label}
        <span className="block truncate font-mono text-sm text-cream">{address}</span>
      </span>
      <span aria-live="polite" className="shrink-0 border-2 border-ink bg-gold px-2.5 py-1 font-narrow text-sm font-bold uppercase tracking-[0.14em] text-ink">
        {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy"}
      </span>
    </button>
  );
}
