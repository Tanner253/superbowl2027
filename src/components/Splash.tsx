"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ENTERED_KEY } from "@/lib/splash";
import Seal from "./Seal";

const GATED = new Set(["/", "/president", "/candidates", "/race", "/voters"]);

export default function Splash() {
  const path = (usePathname() ?? "/").replace(/\/+$/, "") || "/";
  const [open, setOpen] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const show = open && GATED.has(path);

  useEffect(() => {
    if (document.documentElement.dataset.entered) setOpen(false);
  }, []);

  useEffect(() => {
    if (!show) return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    button.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && enter();
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [show]);

  function enter() {
    try {
      localStorage.setItem(ENTERED_KEY, "1");
    } catch {}
    document.documentElement.dataset.entered = "1";
    setLeaving(true);
    setTimeout(() => setOpen(false), 220);
  }

  if (!show) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to US President 2028"
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-clip bg-navy transition-opacity duration-200 [html[data-entered]_&]:hidden ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <div aria-hidden="true" className="absolute inset-0">
        <div className="stars absolute inset-0" />
        <div className="absolute -left-1/4 top-[55%] h-[70%] w-[150%] -rotate-6 bg-red" />
        <div className="stripes absolute -left-1/4 top-[52%] h-6 w-[150%] -rotate-6 opacity-90" />
        <div className="absolute -right-[20%] -top-[30%] h-[80%] w-[60%] rotate-12 bg-blue/60" />
      </div>

      <div className="relative flex animate-rise flex-col items-center px-4 text-center">
        <Seal size={132} className="drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]" />
        <div className="poster-shadow mt-6 font-slab text-[clamp(44px,11vw,104px)] leading-[0.95] text-cream">
          US PRESIDENT
          <br />
          <span className="text-gold">2028</span>
        </div>
        <p className="mt-4 font-narrow text-sm font-bold uppercase tracking-[0.4em] text-cream/90">Exclusively on pump.fun</p>
        <button
          ref={button}
          type="button"
          onClick={enter}
          className="mt-10 border-[3px] border-ink bg-gold px-8 py-4 font-narrow text-xl font-bold uppercase tracking-[0.18em] text-ink shadow-brutal-md transition hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
        >
          Enter the campaign →
        </button>
      </div>
    </div>
  );
}
