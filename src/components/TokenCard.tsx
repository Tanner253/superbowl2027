"use client";

import Link from "next/link";
import { PARTIES, isAlive, statusLabel } from "@/config/candidates";
import { PHOTOS } from "@/config/photos";
import { pumpUrl } from "@/config/site";
import { changeColor, fmtCompact, fmtDir, fmtOdds, fmtOddsDelta, fmtUsd, fmtUsdShort } from "@/lib/format";
import type { CandidateRow } from "@/lib/market-context";

// WC-style coin card: party colour with the candidate's portrait full-bleed on the right.
// Live coins show price + 24h and link to pump.fun. Before launch the headline number is the
// Polymarket win odds and the card links to that market (or to the board, with fallback="board").
export default function TokenCard({
  r,
  banner,
  id,
  fallback = "polymarket",
}: {
  r: CandidateRow;
  banner?: React.ReactNode;
  id?: string;
  fallback?: "polymarket" | "board";
}) {
  const p = PARTIES[r.party];
  const photo = r.image ?? PHOTOS[r.id]?.src;
  const m = r.market;
  const out = !isAlive(r);
  const sub = r.status === "undeclared" ? p.name : statusLabel(r);

  const body = (
    <>
      {banner}
      <div className="relative min-h-0 flex-1" style={{ background: p.color }}>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-y-0 right-0 h-full w-[62%] object-cover object-[50%_18%]" />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: `linear-gradient(90deg, ${p.color} 34%, color-mix(in srgb, ${p.color} 55%, transparent) 58%, transparent 82%)` }}
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-4" style={{ color: p.on }}>
          <div className="max-w-[62%]">
            <div className="line-clamp-2 font-slab text-xl uppercase leading-[0.95] [text-shadow:0_2px_0_rgba(0,0,0,0.45)] sm:text-2xl">
              {r.name}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 font-narrow text-[11px] font-bold uppercase tracking-[0.14em]">
              <span className="border-2 border-gold bg-ink px-1.5 py-0.5 text-gold">${r.ticker}</span>
              <span className="bg-ink/80 px-1.5 py-0.5 text-cream">{sub}</span>
            </div>
          </div>
          <div className="text-cream">
            {m ? (
              <div className="flex items-baseline gap-2">
                <span className="font-slab text-[28px] leading-none tabular-nums [text-shadow:0_2px_0_rgba(0,0,0,0.6)]">{fmtUsd(m.priceUsd)}</span>
                <span className={`font-narrow text-lg font-bold tabular-nums ${changeColor(m.change24h)}`}>{fmtDir(m.change24h)}</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-slab text-[32px] leading-none tabular-nums [text-shadow:0_2px_0_rgba(0,0,0,0.6)]">{fmtOdds(r.odds)}</span>
                <span className="font-narrow text-xs font-bold uppercase tracking-[0.2em]">
                  win odds{r.oddsWeek !== null && <span className={`ml-2 ${changeColor(r.oddsWeek)}`}>{fmtOddsDelta(r.oddsWeek)} 7d</span>}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-3 border-t-[3px] border-cream bg-ink text-center">
        {[
          ["Mkt cap", m ? fmtUsdShort(m.marketCap) : "Soon"],
          ["Vol 24h", m ? fmtUsdShort(m.volume24h) : "Soon"],
          r.holders ? ["Holders", fmtCompact(r.holders.count)] : ["Odds", fmtOdds(r.odds)],
        ].map(([k, v]) => (
          <div key={k} className="px-1 py-2">
            <dt className="font-narrow text-[10px] font-bold uppercase tracking-[0.22em] text-cream/55">{k}</dt>
            <dd className="font-mono text-[13px] font-bold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
    </>
  );

  const cls = `group flex aspect-[4/3] flex-col overflow-hidden border-[3px] border-cream bg-ink scroll-mt-40 transition-[transform,box-shadow] duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-gold sm:aspect-[16/10] ${
    out ? "opacity-60 grayscale hover:opacity-100 hover:grayscale-0" : ""
  }`;

  const external = (href: string, label: string, hint: string) => (
    <a id={id} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={`${cls} relative`}>
      <span className="pointer-events-none absolute right-2 top-2 z-10 border-2 border-ink bg-gold px-1.5 py-0.5 font-narrow text-[11px] font-bold uppercase tracking-[0.14em] text-ink opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
        {hint} ↗
      </span>
      {body}
    </a>
  );
  if (r.mint) return external(pumpUrl(r.mint), `${r.name}: buy $${r.ticker} on pump.fun`, "Buy on pump.fun");
  if (fallback === "polymarket") return external(r.pmUrl, `${r.name}: win odds on Polymarket`, "Odds on Polymarket");
  return (
    <Link id={id} href={`/candidates/#${r.id}`} aria-label={`${r.name} on the candidates board`} className={cls}>
      {body}
    </Link>
  );
}
