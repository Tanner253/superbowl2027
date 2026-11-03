import type { BadgeKey } from "@/config/voters";

// Small pennant-framed glyphs for the 8 Voter Card badges.
const GLYPHS: Record<BadgeKey, React.ReactNode> = {
  REGISTERED: (
    <>
      <path d="M6 13h12v5H6z" />
      <path d="M9 13V7h6v6" />
      <path d="m10.5 10 1 1 2-2" />
    </>
  ),
  STANDARD_BEARER: (
    <>
      <path d="M7 19V5" />
      <path d="M7 5h10l-2 3 2 3H7" />
    </>
  ),
  DIE_HARD: <path d="M12 4 18 6.5v5c0 4-3 6.5-6 7.5-3-1-6-3.5-6-7.5v-5z" />,
  BIG_TENT: (
    <>
      <path d="M4 18 12 6l8 12z" />
      <path d="M12 6v12M10 18l2-4 2 4" />
    </>
  ),
  NOMINEE: (
    <>
      <path d="M8 6h8v4a4 4 0 0 1-8 0z" />
      <path d="M12 14v3M9 18h6" />
    </>
  ),
  RUNNER_UP: (
    <>
      <circle cx="12" cy="9" r="4" />
      <path d="m9.5 12.5-1.5 6 4-2 4 2-1.5-6" />
    </>
  ),
  PRESIDENT_ELECT: (
    <>
      <path d="M5 18h14M6 18v-6M10 18v-6M14 18v-6M18 18v-6M4 12h16L12 6z" />
    </>
  ),
  MYSTERY: <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.1" />,
};

export default function BadgeIcon({ k, lit, size = 28 }: { k: BadgeKey; lit: boolean; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 28"
      width={size}
      height={(size * 28) / 24}
      aria-hidden="true"
      className={lit ? "" : "opacity-25 grayscale"}
    >
      <path d="M2 1h20v19l-10 7L2 20z" fill="var(--color-navy)" stroke="var(--color-cream)" strokeWidth="1.5" />
      <g fill="none" stroke={lit ? "var(--color-gold)" : "var(--color-cream)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {GLYPHS[k]}
      </g>
    </svg>
  );
}
