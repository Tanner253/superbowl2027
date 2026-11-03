import Link from "next/link";
import { ANNOUNCEMENT } from "@/config/site";
import BuyButton from "../BuyButton";
import { Wrap } from "../ui";

// Full-width "Buy $PRESIDENT on pump.fun" band under the hero.
export function BuyBand() {
  return (
    <section className="border-b-4 border-ink bg-ink py-10">
      <Wrap className="flex justify-center">
        <BuyButton size="hero" />
      </Wrap>
    </section>
  );
}

// Optional gold promo band (giveaways, the ballot game). Configured in config/site.ts.
export function Announcement() {
  if (!ANNOUNCEMENT) return null;
  const { tag, title, text, ctas = [] } = ANNOUNCEMENT;
  return (
    <section className="border-y-4 border-ink bg-gold py-10 text-ink">
      <Wrap className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <span className="inline-block border-[3px] border-ink bg-ink px-2 py-1 font-narrow text-xs font-bold uppercase tracking-[0.22em] text-gold">
            {tag}
          </span>
          <h2 className="mt-3 font-slab text-[clamp(26px,4vw,44px)] uppercase leading-[0.95]">{title}</h2>
          {text && <p className="mt-2 text-lg font-medium text-ink/80">{text}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          {ctas.map((c) => {
            const cls =
              "border-[3px] border-ink bg-ink px-5 py-3 font-narrow text-lg font-bold uppercase tracking-[0.14em] text-gold shadow-brutal-cream transition hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[6px] active:translate-y-[6px] active:shadow-none";
            return c.href.startsWith("/") ? (
              <Link key={c.href} href={c.href} className={cls}>
                {c.label}
              </Link>
            ) : (
              <a key={c.href} href={c.href} target="_blank" rel="noopener noreferrer" className={cls}>
                {c.label} ↗
              </a>
            );
          })}
        </div>
      </Wrap>
    </section>
  );
}
