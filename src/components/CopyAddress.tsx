"use client";

import { useState } from "react";

export default function CopyAddress({ address }: { address: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const label = (
    <span className="block font-narrow text-[10px] font-bold uppercase tracking-[0.3em] text-amber">Contract address</span>
  );
  if (!address) {
    return (
      <div className="w-full max-w-[520px] rounded-md border border-dashed border-chalk/40 bg-ink/70 px-3 py-2.5">
        {label}
        <span className="font-mono text-sm text-chalk/70">Drops at launch</span>
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
      className="group flex w-full max-w-[520px] items-center gap-3 rounded-md border border-chalk/30 bg-ink px-3 py-2.5 text-left shadow-panel transition hover:border-amber"
    >
      <span className="min-w-0 flex-1">
        {label}
        <span className="block truncate font-mono text-sm text-chalk">{address}</span>
      </span>
      <span aria-live="polite" className="shrink-0 rounded bg-amber px-2.5 py-1 font-narrow text-sm font-bold uppercase tracking-[0.14em] text-ink">
        {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy"}
      </span>
    </button>
  );
}
