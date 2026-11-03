"use client";

import { useEffect } from "react";
import { seeded } from "@/lib/market";
import { useReducedMotion } from "@/lib/useReducedMotion";

// A game-day ticket stub, stamped "Picks in", in our colours.
export function Stub({ size = 220, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 240 120" width={size} height={(size * 120) / 240} className={className} role="img" aria-label="Picks in ticket stub">
      <path d="M8 4h224a4 4 0 0 1 4 4v34a18 18 0 0 0 0 36v34a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V78a18 18 0 0 0 0-36V8a4 4 0 0 1 4-4z" fill="#f4f7f2" stroke="#04080f" strokeWidth="3" />
      <rect x="10" y="10" width="160" height="24" fill="#0c1a2e" />
      <text x="90" y="27" textAnchor="middle" fontFamily="var(--ff-display), Impact, sans-serif" fontSize="15" letterSpacing="3" fill="#ffc23d">
        SUPER BOWL LXI
      </text>
      <text x="90" y="72" textAnchor="middle" fontFamily="var(--ff-display), Impact, sans-serif" fontSize="34" letterSpacing="1" fill="#04080f">
        PICKS IN
      </text>
      <text x="90" y="96" textAnchor="middle" fontFamily="var(--ff-narrow), sans-serif" fontWeight="700" fontSize="12" letterSpacing="3" fill="#c8102e">
        FEB 14 · 2027 · ON-CHAIN
      </text>
      <path d="M180 10v100" stroke="#04080f" strokeWidth="2" strokeDasharray="4 5" />
      <text x="208" y="62" textAnchor="middle" transform="rotate(-90 208 62)" fontFamily="var(--ff-narrow), sans-serif" fontWeight="700" fontSize="12" letterSpacing="3" fill="#04080f">
        ADMIT ONE
      </text>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={20 + i * 40} y="104" width="22" height="6" fill="#11602f" />
      ))}
    </svg>
  );
}

const COLORS = ["#ffc23d", "#f4f7f2", "#c8102e", "#1f4fd1", "#7cf07a"];
const PIECES = (() => {
  const r = seeded("confetti");
  return Array.from({ length: 54 }, (_, i) => {
    const angle = r() * Math.PI * 2;
    const dist = 160 + r() * 260;
    return {
      x: `${Math.cos(angle) * dist}px`,
      y: `${Math.sin(angle) * dist * 0.8 + 140}px`,
      r: `${(r() - 0.5) * 900}deg`,
      color: COLORS[i % COLORS.length],
      w: 6 + r() * 8,
      h: 10 + r() * 10,
      delay: r() * 0.15,
    };
  });
})();

// Full-screen celebration when the picks are complete: the stub stamps down, confetti bursts out.
export function PicksCelebration({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  useEffect(() => {
    const t = setTimeout(onDone, reduced ? 1800 : 2600);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onDone();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [onDone, reduced]);

  return (
    <div className="fixed inset-0 z-[70] flex cursor-pointer items-center justify-center bg-ink/60" onClick={onDone} role="status" aria-live="polite">
      <span className="sr-only">Picks complete.</span>
      {!reduced && (
        <div aria-hidden="true" className="absolute left-1/2 top-1/2">
          {PIECES.map((p, i) => (
            <span
              key={i}
              className="absolute block rounded-[1px]"
              style={
                {
                  width: p.w,
                  height: p.h,
                  background: p.color,
                  "--x": p.x,
                  "--y": p.y,
                  "--r": p.r,
                  animation: `confetti-fly 1.5s cubic-bezier(.15,.7,.4,1) ${p.delay}s both`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}
      <div className="drop-shadow-[0_18px_40px_rgba(0,0,0,0.6)]" style={{ animation: reduced ? undefined : "stamp 0.55s cubic-bezier(.2,.9,.3,1.2) both", transform: "rotate(-7deg)" }}>
        <Stub size={320} />
      </div>
    </div>
  );
}
