// Small shared building blocks for the poster look. Use these instead of one-off styles.

// Page-width container used by every section.
export function Wrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

// Dog-ear triangle in a card's top-right corner. Parent must be `relative`.
export function Notch({ color = "var(--color-ink)", size = 16 }: { color?: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute right-0 top-0"
      style={{ borderLeft: `${size}px solid transparent`, borderTop: `${size}px solid ${color}` }}
    />
  );
}

// Pulsing "live" dot.
export function LiveDot({ color = "var(--color-red-hot)" }: { color?: string }) {
  return <span aria-hidden="true" className="inline-block h-2.5 w-2.5 animate-pulse-dot rounded-full" style={{ background: color }} />;
}

// Narrow uppercase label used above numbers.
export function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`font-narrow text-[11px] font-bold uppercase tracking-[0.28em] ${className}`}>{children}</div>;
}

// Poster stat block: thick border, hard shadow, notch. tone picks the fill.
const TONES = {
  red: { box: "bg-red text-cream", notch: "var(--color-cream)" },
  gold: { box: "bg-gold text-ink", notch: "var(--color-ink)" },
  cream: { box: "bg-cream text-ink", notch: "var(--color-red)" },
  ink: { box: "bg-ink-2 text-cream", notch: "var(--color-gold)" },
} as const;

export function StatBlock({
  label,
  value,
  sub,
  tone = "ink",
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
    <div className={`relative border-[4px] border-ink p-4 shadow-brutal-md ${t.box} ${className}`}>
      <Notch color={t.notch} />
      <Label className="opacity-85">{label}</Label>
      <div className={`mt-1 font-slab leading-tight tabular-nums ${valueClass}`}>{value}</div>
      {sub && <div className="mt-1 font-narrow text-sm font-bold uppercase tracking-[0.12em]">{sub}</div>}
    </div>
  );
}

// Square segmented control (Cards | Table, Past | Upcoming, 24H | 7D …).
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
    <div role="group" aria-label={label} className="inline-flex border-2 border-cream">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          aria-pressed={value === o.v}
          className={`px-4 py-2 font-narrow text-xs font-bold uppercase tracking-[0.22em] transition sm:px-6 ${
            value === o.v ? "bg-gold text-ink" : "text-cream/75 hover:bg-cream hover:text-ink"
          }`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}
