"use client";

import { useState } from "react";
import { PARTIES, initials, type Candidate } from "@/config/candidates";
import { PHOTOS } from "@/config/photos";

// Candidate portrait (or initials). Round avatars are drawn as pin-back campaign buttons:
// party-colour rim, cream inner ring, glossy highlight, and a little tilt on hover.
// `square` for table cells; `dim` greys out dropped-out candidates (pass dim={false}
// when the parent row/card already fades them).
export default function Avatar({
  c,
  size = 44,
  square = false,
  dim = true,
}: {
  c: Candidate;
  size?: number;
  square?: boolean;
  dim?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const src = broken ? undefined : (c.image ?? PHOTOS[c.id]?.src);
  const p = PARTIES[c.party];
  const rim = square ? 2 : Math.max(2, Math.round(size * 0.09));
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden font-slab ${
        square ? "" : "rounded-full shadow-[0_2px_0_rgba(0,0,0,0.45)] transition-transform duration-200 hover:-rotate-[8deg] hover:scale-105"
      } ${dim && c.status === "out" ? "grayscale" : ""}`}
      style={{
        width: size,
        height: size,
        background: p.color,
        border: `${rim}px solid ${p.color}`,
        color: p.on,
        fontSize: size * 0.36,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)} className="h-full w-full object-cover object-[50%_18%]" />
      ) : (
        initials(c.name)
      )}
      {!square && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            boxShadow: `inset 0 0 0 ${Math.max(1, Math.round(size * 0.035))}px var(--color-cream)`,
            background: "radial-gradient(circle at 32% 24%, rgba(255,255,255,0.45), rgba(255,255,255,0) 42%)",
          }}
        />
      )}
    </span>
  );
}

export function PartyTag({ party }: { party: Candidate["party"] }) {
  const p = PARTIES[party];
  return (
    <span
      className="inline-block px-1.5 py-0.5 font-narrow text-[11px] font-bold tracking-[0.14em]"
      style={{ background: p.color, color: p.on }}
      title={p.name}
    >
      {p.short}
    </span>
  );
}
