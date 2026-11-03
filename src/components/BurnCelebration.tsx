"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/config/site";
import { fmtCompact } from "@/lib/format";
import { seeded } from "@/lib/market";
import { useMarket, type BurnLanded } from "@/lib/market-context";
import { useReducedMotion } from "@/lib/useReducedMotion";

const COLORS = ["#ffc23d", "#f4f7f2", "#ff5a67", "#79a2ff", "#7cf07a"];
const PIECES = (() => {
  const r = seeded("touchdown");
  return Array.from({ length: 46 }, (_, i) => {
    const angle = -Math.PI / 2 + (r() - 0.5) * Math.PI * 1.6;
    const dist = 140 + r() * 260;
    return {
      x: `${Math.cos(angle) * dist}px`,
      y: `${Math.sin(angle) * dist * 0.7 + 220}px`,
      r: `${(r() - 0.5) * 900}deg`,
      color: COLORS[i % COLORS.length],
      w: 6 + r() * 7,
      h: 10 + r() * 9,
      delay: r() * 0.18,
    };
  });
})();

const SHOW_MS = 4200;

// Touchdown! When a burn lands while the page is open (the burned total went up between two
// refreshes), the jumbotron banner drops in with confetti. Reduced motion: a still banner only.
export default function BurnCelebration() {
  const { lastBurn } = useMarket();
  const reduced = useReducedMotion();
  const [shown, setShown] = useState<BurnLanded | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!lastBurn) return;
    setShown(lastBurn);
    setLeaving(false);
    const t1 = setTimeout(() => setLeaving(true), SHOW_MS - 350);
    const t2 = setTimeout(() => setShown(null), SHOW_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [lastBurn]);

  if (!shown) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[84px] z-[65] flex justify-center px-4 lg:top-[92px]" role="status" aria-live="polite">
      {!reduced && (
        <>
          <div aria-hidden="true" className="fixed inset-0 bg-flood/10" style={{ animation: "flash 0.9s ease-out both" }} />
          <div aria-hidden="true" className="absolute left-1/2 top-6">
            {PIECES.map((p, i) => (
              <span
                key={`${shown.at}-${i}`}
                className="absolute block rounded-[1px]"
                style={
                  {
                    width: p.w,
                    height: p.h,
                    background: p.color,
                    "--x": p.x,
                    "--y": p.y,
                    "--r": p.r,
                    animation: `confetti-fly 1.6s cubic-bezier(.15,.7,.4,1) ${p.delay}s both`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        </>
      )}
      <div
        className="led relative overflow-hidden rounded-lg border-2 border-amber bg-ink px-6 py-4 text-center shadow-glow sm:px-10"
        style={reduced ? undefined : { animation: leaving ? "td-out 0.35s ease-in both" : "td-in 0.6s cubic-bezier(.2,.9,.3,1.2) both" }}
      >
        <div className="scanlines pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="led-text font-display text-[clamp(40px,8vw,76px)] uppercase leading-none tracking-[0.04em]">Touchdown!</div>
        <div className="mt-1 font-narrow text-base font-bold uppercase tracking-[0.24em] text-chalk sm:text-lg">
          Burn landed · <span className="text-red-hot">{fmtCompact(shown.amount)}</span> ${SITE.ticker} gone for good
        </div>
      </div>
    </div>
  );
}
