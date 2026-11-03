import type { BadgeKey } from "@/config/voters";

// Small shield-framed glyphs for the 8 Fan Card badges.
const GLYPHS: Record<BadgeKey, React.ReactNode> = {
  // Season Ticket.
  REGISTERED: (
    <>
      <path d="M5 8h14v2.5a1.5 1.5 0 0 0 0 3V16H5v-2.5a1.5 1.5 0 0 0 0-3z" />
      <path d="M14 8v8" strokeDasharray="1.5 1.5" />
    </>
  ),
  // Captain: the "C" patch.
  STANDARD_BEARER: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M14.5 9.5a3.5 3.5 0 1 0 0 5" />
    </>
  ),
  // Die-Hard: a foam finger.
  DIE_HARD: (
    <>
      <path d="M10 18v-6H8.5a1.5 1.5 0 0 1 0-3H10V5.5a1.5 1.5 0 0 1 3 0V9h2.5a1.5 1.5 0 0 1 1.5 1.5V18z" />
    </>
  ),
  // Front Office: a play drawn on a clipboard.
  BIG_TENT: (
    <>
      <rect x="6" y="5" width="12" height="14" rx="1.5" />
      <path d="M9 9l2 2M11 9l-2 2M14 14.5a1.5 1.5 0 1 0 0 .01M10.5 12.5c1.5 0 2 1 2.5 2" />
    </>
  ),
  // Conference Champ: a pennant.
  NOMINEE: (
    <>
      <path d="M7 19V5" />
      <path d="M7 6l11 3.5L7 13" />
    </>
  ),
  // Runner-Up: a medal.
  RUNNER_UP: (
    <>
      <circle cx="12" cy="14" r="4" />
      <path d="M9.5 10.5 8 5h3l1 3 1-3h3l-1.5 5.5" />
    </>
  ),
  // Champion: a ring.
  PRESIDENT_ELECT: (
    <>
      <ellipse cx="12" cy="14.5" rx="5" ry="4" />
      <path d="M9 10.5 10 6h4l1 4.5" />
      <path d="M10.5 8h3" />
    </>
  ),
  MYSTERY: <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.1" />,
};

export default function BadgeIcon({ k, lit, size = 28 }: { k: BadgeKey; lit: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 24 28" width={size} height={(size * 28) / 24} aria-hidden="true" className={lit ? "" : "opacity-25 grayscale"}>
      <path d="M2 1h20v17c0 4-5 7.5-10 9-5-1.5-10-5-10-9z" fill="var(--color-night-2)" stroke="var(--color-chalk)" strokeWidth="1.5" />
      <g fill="none" stroke={lit ? "var(--color-amber)" : "var(--color-chalk)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {GLYPHS[k]}
      </g>
    </svg>
  );
}
