// Inline stroke icons (24×24 grid), sized by the parent's font-size via 1em.
type P = { className?: string };
const base = {
  width: "1em",
  height: "1em",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconHome = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 11 12 4l9 7" />
    <path d="M5 10v10h14V10" />
    <path d="M10 20v-6h4v6" />
  </svg>
);
export const IconCoin = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m12 7 1.5 3.2 3.5.4-2.6 2.4.7 3.5L12 14.8 8.9 16.5l.7-3.5L7 10.6l3.5-.4z" />
  </svg>
);
export const IconUsers = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 20V9l8-5 8 5v11" />
    <path d="M9 20v-6h6v6" />
    <path d="M4 9h16" />
  </svg>
);
// The road to the Super Bowl: a bracket.
export const IconFlag = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 5h5v5H3zM3 14h5v5H3z" />
    <path d="M8 7.5h3v9H8M11 12h3" />
    <path d="M14 9.5h7v5h-7z" />
  </svg>
);
// Fan Card: a ticket.
export const IconBallot = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z" />
    <path d="M14 7v10" strokeDasharray="2 2" />
  </svg>
);
export const IconFootball = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4.5 19.5c-1.6-5 .4-11 5-13.8 2.6-1.6 6.4-2.2 10-1.2 1 3.6.4 7.4-1.2 10-2.8 4.6-8.8 6.6-13.8 5z" />
    <path d="m9 15 6-6M10.5 10.5l3 3M12.5 8.5l3 3M8.5 12.5l3 3" />
  </svg>
);
export const IconMinus = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 12h12" />
  </svg>
);
export const IconClose = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const IconX = (p: P) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M17.7 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L1.8 3h6.4l4.4 5.9zm-1.1 16.2h1.7L7.5 4.7H5.7z" />
  </svg>
);
export const IconTelegram = (p: P) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M21.4 4.2 2.9 11.3c-1.3.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.3-.5-1.9-1.5-1.8zM9.6 14.1l9-5.7c.4-.3.8-.1.5.2l-7.7 7-.3 3.2z" />
  </svg>
);
export const IconTikTok = (p: P) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M16.6 2h-3.3v13.3a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.1a6.3 6.3 0 1 0 5.3 6.2V8.6a7.7 7.7 0 0 0 4.4 1.4V6.7a4.4 4.4 0 0 1-4.4-4.7z" />
  </svg>
);
export const IconInstagram = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r=".6" fill="currentColor" />
  </svg>
);

export const SOCIAL_ICONS: Record<string, (p: P) => React.JSX.Element> = {
  X: IconX,
  Telegram: IconTelegram,
  TikTok: IconTikTok,
  Instagram: IconInstagram,
};
