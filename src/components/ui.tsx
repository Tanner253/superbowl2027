// Small shared building blocks for the stadium look. Use these instead of one-off styles.

// Page-width container used by every section.
export function Wrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

// Pylon: the little orange marker at an end-zone corner. Parent must be `relative`.
export function Pylon({ color = "var(--color-amber)" }: { color?: string }) {
  return <span aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-3 w-3" style={{ background: color }} />;
}

// Pulsing "live" dot.
export function LiveDot({ color = "var(--color-red-hot)" }: { color?: string }) {
  return <span aria-hidden="true" className="inline-block h-2.5 w-2.5 animate-pulse-dot rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />;
}

// Narrow uppercase label used above numbers.
export function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`font-narrow text-[11px] font-bold uppercase tracking-[0.28em] ${className}`}>{children}</div>;
}

// Scoreboard stat block. tone picks the fill: led (black board, amber numerals), turf, chalk, night.
const TONES = {
  led: { box: "bg-ink text-chalk border-amber/40", value: "led-text", pylon: "var(--color-amber)" },
  turf: { box: "turf text-chalk border-chalk/25", value: "flood-text", pylon: "var(--color-chalk)" },
  chalk: { box: "bg-chalk text-ink border-chalk", value: "", pylon: "var(--color-amber-deep)" },
  night: { box: "panel text-chalk", value: "", pylon: "var(--color-amber)" },
  red: { box: "bg-afc text-chalk border-afc-hot/50", value: "flood-text", pylon: "var(--color-chalk)" },
} as const;

export function StatBlock({
  label,
  value,
  sub,
  tone = "night",
  className = "",
  valueClass = "text-[clamp(28px,4vw,44px)]",
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
  valueClass?: string;
}) {
  const t = TONES[tone];
  return (
    <div className={`relative overflow-hidden rounded-md border p-4 shadow-panel ${t.box} ${className}`}>
      <Pylon color={t.pylon} />
      <Label className="opacity-80">{label}</Label>
      <div className={`mt-1 font-display leading-tight tabular-nums ${t.value} ${valueClass}`}>{value}</div>
      {sub && <div className="mt-1 font-narrow text-sm font-bold uppercase tracking-[0.12em] opacity-90">{sub}</div>}
    </div>
  );
}

// Segmented control (Table | Cards, Past | Upcoming …).
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { v: T; l: React.ReactNode }[];
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-md border border-chalk/25 bg-ink/60 p-1">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          aria-pressed={value === o.v}
          className={`rounded px-4 py-2 font-narrow text-xs font-bold uppercase tracking-[0.22em] transition sm:px-6 ${
            value === o.v ? "bg-amber text-ink shadow-glow-sm" : "text-chalk/75 hover:bg-chalk/10 hover:text-chalk"
          }`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}
