"use client";

import { SITE, pumpUrl } from "@/config/site";
import { useMarket } from "@/lib/market-context";

const SIZES = {
  sm: "border-2 px-3 py-2 text-[13px] shadow-brutal-sm",
  lg: "border-[3px] px-6 py-4 text-lg sm:text-xl shadow-brutal-red",
  hero: "border-[3px] px-6 py-4 font-slab text-[clamp(18px,3vw,30px)] tracking-[0.04em] sm:px-10 sm:py-6 shadow-brutal-cream",
};

export default function BuyButton({
  mint: mintProp,
  ticker = SITE.ticker,
  size = "lg",
  className = "",
}: {
  mint?: string;
  ticker?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { mints } = useMarket();
  const mint = mintProp ?? mints.main;
  const base = `inline-flex items-center justify-center gap-2 border-ink text-center uppercase ${
    size === "hero" ? "" : "font-narrow font-bold tracking-[0.12em]"
  } ${SIZES[size]} ${className}`;
  if (!mint) {
    if (size === "sm")
      return <span className={`${base} cursor-default whitespace-nowrap bg-ink-3 text-cream/70 shadow-none`}>${ticker} · Soon</span>;
    return (
      <span className="inline-flex flex-col items-center border-[3px] border-dashed border-cream/50 bg-ink/70 px-6 py-3 text-center">
        <span className="font-narrow text-xs font-bold uppercase tracking-[0.3em] text-gold">Launching soon</span>
        <span className="font-narrow text-lg font-bold uppercase tracking-[0.14em] text-cream sm:text-xl">
          ${ticker} on pump.fun
        </span>
      </span>
    );
  }
  return (
    <a
      href={pumpUrl(mint)}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} bg-gold text-ink transition hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none`}
    >
      Buy ${ticker} on pump.fun <span aria-hidden="true">↗</span>
    </a>
  );
}
