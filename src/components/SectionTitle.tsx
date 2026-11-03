export default function SectionTitle({
  kicker,
  title,
  aside,
  id,
}: {
  kicker: string;
  title: React.ReactNode;
  aside?: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 font-narrow text-[11px] font-bold uppercase tracking-[0.4em] text-amber">
          <span aria-hidden="true" className="h-0.5 w-4 bg-amber shadow-[0_0_8px_var(--color-amber)]" />
          {kicker}
        </div>
        <h2 id={id} className="flood-text mt-2 font-display text-[clamp(32px,5vw,62px)] uppercase leading-[0.95] tracking-[0.01em]">
          {title}
        </h2>
        <div aria-hidden="true" className="hashmarks mt-3 h-2 w-40 opacity-60" />
      </div>
      {aside}
    </div>
  );
}
