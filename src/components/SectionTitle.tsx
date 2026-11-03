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
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 font-narrow text-[11px] font-bold uppercase tracking-[0.4em] text-gold">
          <span aria-hidden="true" className="h-1 w-3 bg-gold" />
          {kicker}
        </div>
        <h2 id={id} className="mt-2 font-slab text-[clamp(30px,5vw,60px)] uppercase leading-[0.95]">
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}
