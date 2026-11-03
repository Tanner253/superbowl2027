"use client";

import { SITE, pumpUrl } from "@/config/site";
import { useMarket } from "@/lib/market-context";

const SIZES = {
  sm: "rounded px-3 py-2 text-[13px]",
  lg: "rounded-md px-6 py-4 text-lg sm:text-xl shadow-glow-sm",
  hero: "rounded-md px-6 py-4 font-display text-[clamp(20px,3vw,32px)] tracking-[0.04em] sm:px-10 sm:py-5 shadow-glow",
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
  const base = `inline-flex items-center justify-center gap-2 text-center uppercase ${
    size === "hero" ? "" : "font-narrow font-bold tracking-[0.12em]"
  } ${SIZES[size]} ${className}`;
  if (!mint) {
    if (size === "sm")
      return <span className={`${base} cursor-default whitespace-nowrap border border-chalk/20 bg-night-3 text-chalk/70`}>${ticker} · Soon</span>;
    return (
      <span className="inline-flex flex-col items-center rounded-md border border-dashed border-chalk/40 bg-ink/70 px-6 py-3 text-center">
        <span className="font-narrow text-xs font-bold uppercase tracking-[0.3em] text-amber">Launching soon</span>
        <span className="font-narrow text-lg font-bold uppercase tracking-[0.14em] text-chalk sm:text-xl">${ticker} on pump.fun</span>
      </span>
    );
  }
  return (
    <a
      href={pumpUrl(mint)}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} bg-amber text-ink transition hover:-translate-y-0.5 hover:bg-flood active:translate-y-0.5`}
    >
      Buy ${ticker} on pump.fun <span aria-hidden="true">↗</span>
    </a>
  );
}
