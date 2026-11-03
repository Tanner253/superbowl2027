import { Wrap } from "./ui";

// Full-bleed hero at the top of every page: a floodlit field at night. Shapes are decorative.
const FIELDS = {
  night: "from-night-2 via-night to-ink",
  turf: "from-turf-2 via-turf to-ink",
  afc: "from-[#3a0a14] via-night to-ink",
} as const;

export default function PageHero({
  variant = "night",
  kicker,
  title,
  subtitle,
  children,
  aside,
  titleClass = "text-[clamp(44px,9vw,120px)]",
}: {
  variant?: keyof typeof FIELDS;
  kicker?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  aside?: React.ReactNode;
  titleClass?: string;
}) {
  return (
    <section className={`relative overflow-hidden border-b border-amber/40 bg-gradient-to-b ${FIELDS[variant]}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Floodlight banks and their glow. */}
        <div className="absolute -left-24 -top-32 h-[420px] w-[420px] rounded-full bg-flood/10 blur-3xl" />
        <div className="absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-flood/10 blur-3xl" />
        {/* The field in perspective along the bottom edge. */}
        <div className="absolute inset-x-0 bottom-0 h-[52%] [mask-image:linear-gradient(to_bottom,transparent_45%,#000_100%)] [perspective:600px]">
          <div className="turf absolute inset-x-[-30%] bottom-[-40%] top-0 origin-bottom [transform:rotateX(62deg)]">
            <div className="yardlines absolute inset-0" />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,rgb(255_243_207/0.14),transparent_70%)]" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink/70 to-transparent" />
      </div>
      <Wrap className="relative grid gap-8 py-12 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="min-w-0">
          {kicker && <div className="font-narrow text-sm font-bold uppercase tracking-[0.32em] text-amber">{kicker}</div>}
          <h1 className={`flood-text mt-2 break-words font-display uppercase leading-[0.9] ${titleClass}`}>{title}</h1>
          {subtitle && <p className="mt-5 max-w-xl text-lg text-chalk/85">{subtitle}</p>}
          {children}
        </div>
        {aside && <div className="min-w-0">{aside}</div>}
      </Wrap>
    </section>
  );
}
