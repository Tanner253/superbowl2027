import { CONFERENCES, type Conference, type Team } from "@/config/candidates";

// A team's round badge: team colour, a stripe in its second colour and its scoreboard code. Drawn
// by us, no logos. `square` for table cells; `dim` greys out eliminated teams (pass dim={false}
// when the parent row/card already fades them).
export default function TeamBadge({
  c,
  size = 44,
  square = false,
  dim = true,
}: {
  c: Pick<Team, "abbr" | "color" | "stripe" | "on" | "status">;
  size?: number;
  square?: boolean;
  dim?: boolean;
}) {
  const ring = Math.max(2, Math.round(size * 0.07));
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden font-display leading-none ${
        square ? "rounded" : "rounded-full shadow-[0_2px_0_rgba(0,0,0,0.45)] transition-transform duration-200 hover:-rotate-[8deg] hover:scale-105"
      } ${dim && c.status === "out" ? "grayscale" : ""}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${c.color} 0 58%, ${c.stripe} 58% 70%, ${c.color} 70%)`,
        boxShadow: square ? undefined : `inset 0 0 0 ${ring}px ${c.stripe}`,
        color: c.on,
        fontSize: size * (c.abbr.length > 2 ? 0.34 : 0.42),
        letterSpacing: "0.02em",
      }}
    >
      <span className="relative [text-shadow:0_1px_0_rgba(0,0,0,0.45)]">{c.abbr}</span>
      {!square && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle at 32% 24%, rgba(255,255,255,0.35), rgba(255,255,255,0) 45%)" }}
        />
      )}
    </span>
  );
}

export function ConferenceTag({ conference }: { conference: Conference }) {
  const p = CONFERENCES[conference];
  return (
    <span
      className="inline-block rounded-sm px-1.5 py-0.5 font-narrow text-[11px] font-bold tracking-[0.14em]"
      style={{ background: p.color, color: p.on }}
      title={p.name}
    >
      {p.short}
    </span>
  );
}
