"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/config/site";
import { fmtCompact, timeAgo } from "@/lib/format";
import { useMarket } from "@/lib/market-context";
import { pad2, useNow } from "@/lib/useNow";
import { useReducedMotion } from "@/lib/useReducedMotion";

// The jumbotron's burn cam: a live feed pointed at the burn counter, in LED numerals.
export default function BurnCam() {
  const { stats, loaded, statsFailed } = useMarket();
  const now = useNow();
  const timecode = useTimecode();
  const burned = stats?.totalBurned ?? 0;
  const live = !!stats && (stats.cycles > 0 || burned > 0);
  const pct = (burned / SITE.totalSupply) * 100;

  return (
    <div className="led relative aspect-[16/10] w-full overflow-hidden rounded-xl border-2 border-chalk/20 bg-black shadow-glow">
      <div className="absolute inset-0 origin-center animate-[crt-on_0.6s_ease-out_both]">
        <div className="scanlines pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.75))]" aria-hidden="true" />
        {(["left-3 top-3 border-l-2 border-t-2", "right-3 top-3 border-r-2 border-t-2", "bottom-3 left-3 border-b-2 border-l-2", "bottom-3 right-3 border-b-2 border-r-2"] as const).map((c) => (
          <span key={c} aria-hidden="true" className={`absolute h-5 w-5 border-amber/70 ${c}`} />
        ))}

        <div className="absolute inset-x-6 top-5 flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-chalk/85 sm:text-xs">
          <span className="flex items-center gap-1.5 text-red-hot">
            <span className="animate-blink">●</span> REC
          </span>
          <span>Jumbotron · burn cam</span>
          <span className="tabular-nums">{timecode}</span>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center" aria-live="polite">
          {!loaded ? (
            <span className="font-mono text-sm uppercase tracking-[0.3em] text-chalk/60">Tuning in…</span>
          ) : live ? (
            <>
              <span className="led-text font-display text-[clamp(50px,8vw,92px)] leading-none tabular-nums">
                {fmtCompact(burned)}
              </span>
              <span className="mt-1 font-narrow text-lg font-bold uppercase tracking-[0.22em] text-red-hot">${SITE.ticker} burned</span>
              <span className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-chalk/70">{pct.toFixed(2)}% supply burnt</span>
              {statsFailed && <span className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-amber">Signal lost · last known value</span>}
            </>
          ) : (
            <>
              <span className="led-text animate-blink font-display text-[clamp(36px,6vw,60px)] leading-none tracking-[0.06em]">STANDBY</span>
              <span className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-chalk/60">
                {statsFailed ? "No signal" : "No signal · burns start at launch"}
              </span>
            </>
          )}
        </div>

        <div className="absolute inset-x-6 bottom-5 flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-chalk/70 sm:text-xs">
          <span>HD</span>
          <span>{live && stats?.lastCycleAt && now !== null ? `Last burn ${timeAgo(stats.lastCycleAt, now)}` : "Cam 01"}</span>
          <span>X1.0 · Auto</span>
        </div>
      </div>
    </div>
  );
}

// HH:MM:SS:FF running at 30 fps since the page opened.
function useTimecode() {
  const reduced = useReducedMotion();
  const [tc, setTc] = useState("00:00:00:00");
  const start = useRef(0);
  useEffect(() => {
    if (reduced) return;
    start.current = performance.now();
    let raf = 0;
    let last = "";
    const tick = (t: number) => {
      const frames = Math.floor(((t - start.current) / 1000) * 30);
      const s = Math.floor(frames / 30);
      const next = `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}:${pad2(frames % 30)}`;
      if (next !== last) setTc((last = next));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);
  return tc;
}
