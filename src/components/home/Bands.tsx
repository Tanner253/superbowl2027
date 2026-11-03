import Link from "next/link";
import { ANNOUNCEMENT } from "@/config/site";
import BuyButton from "../BuyButton";
import { Wrap } from "../ui";

// Full-width "Buy $SUPERBOWL on pump.fun" band under the hero.
export function BuyBand() {
  return (
    <section className="turf relative border-b border-amber/30 py-10">
      <div aria-hidden="true" className="yardlines absolute inset-0" />
      <Wrap className="relative flex justify-center">
        <BuyButton size="hero" />
      </Wrap>
    </section>
  );
}

// Optional amber promo band (giveaways, the Pick'em game). Configured in config/site.ts.
export function Announcement() {
  if (!ANNOUNCEMENT) return null;
  const { tag, title, text, ctas = [] } = ANNOUNCEMENT;
  return (
    <section className="relative overflow-hidden border-y border-ink bg-amber py-10 text-ink">
      <div aria-hidden="true" className="endzone absolute inset-y-0 right-0 w-24 opacity-20 [mask-image:linear-gradient(90deg,transparent,#000)]" />
      <Wrap className="relative flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <span className="inline-block rounded-sm bg-ink px-2 py-1 font-narrow text-xs font-bold uppercase tracking-[0.22em] text-amber">{tag}</span>
          <h2 className="mt-3 font-display text-[clamp(28px,4vw,48px)] uppercase leading-[0.95]">{title}</h2>
          {text && <p className="mt-2 text-lg font-medium text-ink/80">{text}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          {ctas.map((c) => {
            const cls =
              "whitespace-nowrap rounded-md bg-ink px-5 py-3 font-narrow text-lg font-bold uppercase tracking-[0.14em] text-amber shadow-lift transition hover:-translate-y-0.5 active:translate-y-0.5";
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
