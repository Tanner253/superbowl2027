"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/config/site";
import { ENTERED_KEY } from "@/lib/splash";
import Badge from "./Badge";

const GATED = new Set(["/", "/superbowl", "/teams", "/road", "/fans"]);

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
      aria-label={`Welcome to ${SITE.name}`}
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-clip bg-ink transition-opacity duration-200 [html[data-entered]_&]:hidden ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute -left-1/4 -top-1/3 h-[80%] w-[70%] rounded-full bg-flood/15 blur-3xl" />
        <div className="absolute -right-1/4 -top-1/3 h-[80%] w-[70%] rounded-full bg-flood/15 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 [mask-image:linear-gradient(to_bottom,transparent_40%,#000_100%)] [perspective:500px]">
          <div className="turf absolute inset-x-[-40%] bottom-[-30%] top-0 origin-bottom [transform:rotateX(64deg)]">
            <div className="yardlines absolute inset-0" />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,rgb(255_243_207/0.16),transparent_70%)]" />
        </div>
      </div>

      <div className="relative flex animate-rise flex-col items-center px-4 text-center">
        <Badge size={136} className="drop-shadow-[0_0_40px_rgba(255,194,61,0.35)]" />
        <div className="flood-text mt-6 font-display text-[clamp(52px,12vw,116px)] uppercase leading-[0.9] text-chalk">
          Super Bowl
          <br />
          <span className="text-amber">2027</span>
        </div>
        <p className="mt-4 font-narrow text-sm font-bold uppercase tracking-[0.4em] text-chalk/90">Exclusively on pump.fun</p>
        <button
          ref={button}
          type="button"
          onClick={enter}
          className="mt-10 rounded-md bg-amber px-8 py-4 font-narrow text-xl font-bold uppercase tracking-[0.18em] text-ink shadow-glow transition hover:-translate-y-0.5 hover:bg-flood active:translate-y-0.5"
        >
          Enter the stadium →
        </button>
      </div>
    </div>
  );
}
