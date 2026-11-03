import { Wrap } from "./ui";

// Full-bleed poster hero used at the top of every page. Shapes are decorative.
const SHAPES = {
  navy: (
    <>
      <div className="absolute -left-40 -top-40 h-[440px] w-[440px] rounded-full bg-red/80" />
      <div className="absolute -right-24 top-10 h-[120%] w-[38%] rotate-12 bg-blue/50" />
      <div className="stripes absolute -bottom-3 left-0 h-5 w-full opacity-80" />
    </>
  ),
  red: (
    <>
      <div className="absolute -right-[10%] -top-1/3 h-[150%] w-[45%] rotate-12 bg-navy" />
      <div className="absolute -left-24 bottom-[-180px] h-[360px] w-[360px] rounded-full bg-red-deep" />
      <div className="stripes absolute -right-[10%] top-[58%] h-5 w-[60%] -rotate-6 opacity-90" />
    </>
  ),
  blue: (
    <>
      <div className="absolute -left-[8%] -top-1/3 h-[150%] w-[40%] -rotate-12 bg-navy" />
      <div className="absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-red/85" />
      <div className="stripes absolute bottom-6 -left-[5%] h-5 w-[55%] rotate-3 opacity-90" />
    </>
  ),
} as const;

const BG = { navy: "bg-navy", red: "bg-red", blue: "bg-blue" } as const;

export default function PageHero({
  variant = "navy",
  kicker,
  title,
  subtitle,
  children,
  aside,
  titleClass = "text-[clamp(44px,9vw,120px)]",
}: {
  variant?: keyof typeof SHAPES;
  kicker?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  aside?: React.ReactNode;
  titleClass?: string;
}) {
  return (
    <section className={`relative overflow-hidden border-b-4 border-gold ${BG[variant]}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="stars absolute inset-0" />
        {SHAPES[variant]}
      </div>
      <Wrap className="relative grid gap-8 py-12 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="min-w-0">
          {kicker && <div className="font-narrow text-sm font-bold uppercase tracking-[0.32em] text-gold">{kicker}</div>}
          <h1 className={`poster-shadow mt-2 break-words font-slab uppercase leading-[0.88] ${titleClass}`}>{title}</h1>
          {subtitle && <p className="mt-5 max-w-xl text-lg text-cream/85">{subtitle}</p>}
          {children}
        </div>
        {aside && <div className="min-w-0">{aside}</div>}
      </Wrap>
    </section>
  );
}
