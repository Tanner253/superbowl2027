"use client";

import Link from "next/link";
import { isAlive, statusLabel } from "@/config/candidates";
import { pumpUrl } from "@/config/site";
import { changeColor, fmtCompact, fmtDir, fmtOdds, fmtOddsDelta, fmtUsd, fmtUsdShort } from "@/lib/format";
import type { TeamRow } from "@/lib/market-context";

// A team's coin card in team colours: city and nickname set big, the scoreboard code as a
// jersey-number watermark, and a stripe in the second colour. No logos.
// Live coins show price + 24h and link to pump.fun. Before launch the headline number is the
// Polymarket title odds and the card links to that market (or to the board, with fallback="board").
export default function TokenCard({
  r,
  banner,
  id,
  fallback = "polymarket",
}: {
  r: TeamRow;
  banner?: React.ReactNode;
  id?: string;
  fallback?: "polymarket" | "board";
}) {
  const m = r.market;
  const out = !isAlive(r);
  const sub = r.status === "running" ? `${r.conference} · Alive` : statusLabel(r);

  const body = (
    <>
      {banner}
      <div className="relative min-h-0 flex-1 overflow-hidden" style={{ background: r.color, color: r.on }}>
        <div aria-hidden="true" className="absolute inset-y-0 right-[22%] w-5 -skew-x-[18deg]" style={{ background: r.stripe }} />
        <div aria-hidden="true" className="absolute inset-y-0 right-[22%] w-1.5 translate-x-7 -skew-x-[18deg] opacity-70" style={{ background: r.stripe }} />
        <div
          aria-hidden="true"
          className="absolute -right-2 bottom-[-0.12em] font-display text-[clamp(96px,14vw,150px)] leading-none opacity-[0.16]"
          style={{ color: r.on }}
        >
          {r.abbr}
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-4">
          <div className="max-w-[78%]">
            <div className="font-narrow text-sm font-bold uppercase tracking-[0.22em] opacity-85">{r.city}</div>
            <div className="font-display text-[clamp(30px,3.4vw,40px)] uppercase leading-[0.9] [text-shadow:0_2px_0_rgba(0,0,0,0.35)]">{r.nickname}</div>
            <div className="mt-2 flex flex-wrap gap-1.5 font-narrow text-[11px] font-bold uppercase tracking-[0.14em]">
              <span className="rounded-sm bg-ink px-1.5 py-0.5 text-amber">${r.ticker}</span>
              <span className="rounded-sm bg-ink/70 px-1.5 py-0.5 text-chalk">{sub}</span>
            </div>
          </div>
          <div className="text-chalk">
            {m ? (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[30px] leading-none tabular-nums [text-shadow:0_2px_0_rgba(0,0,0,0.6)]">{fmtUsd(m.priceUsd)}</span>
                <span className={`font-narrow text-lg font-bold tabular-nums ${changeColor(m.change24h)}`}>{fmtDir(m.change24h)}</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[34px] leading-none tabular-nums [text-shadow:0_2px_0_rgba(0,0,0,0.6)]">{fmtOdds(r.odds)}</span>
                <span className="font-narrow text-xs font-bold uppercase tracking-[0.2em]">
                  title odds{r.oddsWeek !== null && <span className={`ml-2 ${changeColor(r.oddsWeek)}`}>{fmtOddsDelta(r.oddsWeek)} 7d</span>}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-3 border-t border-chalk/15 bg-ink text-center">
        {[
          ["Mkt cap", m ? fmtUsdShort(m.marketCap) : "Soon"],
          ["Vol 24h", m ? fmtUsdShort(m.volume24h) : "Soon"],
          r.holders ? ["Holders", fmtCompact(r.holders.count)] : ["Odds", fmtOdds(r.odds)],
        ].map(([k, v]) => (
          <div key={k} className="px-1 py-2">
            <dt className="font-narrow text-[10px] font-bold uppercase tracking-[0.22em] text-chalk/55">{k}</dt>
            <dd className="font-mono text-[13px] font-bold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
    </>
  );

  const cls = `group flex aspect-[4/3] flex-col overflow-hidden rounded-xl border border-chalk/15 bg-ink shadow-panel scroll-mt-40 transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:shadow-glow sm:aspect-[16/10] ${
    out ? "opacity-60 grayscale hover:opacity-100 hover:grayscale-0" : ""
  }`;

  const external = (href: string, label: string, hint: string) => (
    <a id={id} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={`${cls} relative`}>
      <span className="pointer-events-none absolute right-2 top-2 z-10 rounded-sm bg-amber px-1.5 py-0.5 font-narrow text-[11px] font-bold uppercase tracking-[0.14em] text-ink opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
        {hint} ↗
      </span>
      {body}
    </a>
  );
  if (r.mint) return external(pumpUrl(r.mint), `${r.name}: buy $${r.ticker} on pump.fun`, "Buy on pump.fun");
  if (fallback === "polymarket") return external(r.pmUrl, `${r.name}: title odds on Polymarket`, "Odds on Polymarket");
  return (
    <Link id={id} href={`/teams/#${r.id}`} aria-label={`${r.name} on the teams board`} className={cls}>
      {body}
    </Link>
  );
}
