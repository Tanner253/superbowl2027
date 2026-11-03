"use client";

import { useEffect, useId } from "react";
import { seeded } from "@/lib/market";
import { useReducedMotion } from "@/lib/useReducedMotion";

// The classic round "I VOTED" sticker, in our colours.
export function Sticker({ size = 200, className = "" }: { size?: number; className?: string }) {
  const clip = useId();
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} role="img" aria-label="I voted 2028 sticker">
      <defs>
        <clipPath id={clip}>
          <circle cx="100" cy="100" r="88" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="96" fill="#f7f0e1" stroke="#060f27" strokeWidth="4" />
      <g clipPath={`url(#${clip})`}>
        <rect x="0" y="0" width="200" height="200" fill="#f7f0e1" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x="0" y={128 + i * 16} width="200" height="8" fill="#d62839" />
        ))}
        <rect x="0" y="0" width="200" height="62" fill="#0b1b42" />
        {[30, 62, 100, 138, 170].map((x, i) => (
          <path
            key={x}
            transform={`translate(${x} ${i % 2 ? 22 : 36}) scale(0.55)`}
            d="M0-12 3.5-3.7 12.4-3.7 5.3 1.6 8 10.2 0 5 -8 10.2 -5.3 1.6 -12.4-3.7 -3.5-3.7z"
            fill="#e9b949"
          />
        ))}
      </g>
      <circle cx="100" cy="100" r="88" fill="none" stroke="#060f27" strokeWidth="3" />
      <text
        x="100"
        y="104"
        textAnchor="middle"
        textLength="150"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--ff-slab), Georgia, serif"
        fontSize="38"
        fill="#d62839"
        stroke="#060f27"
        strokeWidth="1.5"
      >
        I VOTED
      </text>
      <text x="100" y="124" textAnchor="middle" fontFamily="var(--ff-narrow), sans-serif" fontWeight="700" fontSize="15" letterSpacing="3" fill="#0b1b42">
        ON-CHAIN · 2028
      </text>
    </svg>
  );
}

const COLORS = ["#d62839", "#f7f0e1", "#3d6fd9", "#e9b949"];
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

// Full-screen celebration when a ballot is completed: sticker slaps on, confetti bursts out.
export function VotedCelebration({ onDone }: { onDone: () => void }) {
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
    <div className="fixed inset-0 z-[70] flex cursor-pointer items-center justify-center bg-ink/50" onClick={onDone} role="status" aria-live="polite">
      <span className="sr-only">Ballot complete. You voted.</span>
      {!reduced && (
        <div aria-hidden="true" className="absolute left-1/2 top-1/2">
          {PIECES.map((p, i) => (
            <span
              key={i}
              className="absolute block"
              style={
                {
                  width: p.w,
                  height: p.h,
                  background: p.color,
                  border: "1px solid #060f27",
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
      <div className="drop-shadow-[8px_10px_0_rgba(0,0,0,0.45)]" style={{ animation: reduced ? undefined : "sticker-slap 0.55s cubic-bezier(.2,.9,.3,1.2) both", transform: "rotate(-7deg)" }}>
        <Sticker size={240} />
      </div>
    </div>
  );
}
