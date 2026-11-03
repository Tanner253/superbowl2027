"use client";

import { CONFERENCES } from "@/config/candidates";
import { GROUP_COINS, groupKey } from "@/config/parties";
import { pumpUrl } from "@/config/site";
import { changeColor, fmtCompact, fmtDir, fmtUsd, fmtUsdShort } from "@/lib/format";
import { useMarket } from "@/lib/market-context";
import SectionTitle from "./SectionTitle";
import { Label, Wrap } from "./ui";

// The conference coins: a card each, in the conference's colour, linking to pump.fun once live.
export default function ConferencesSection() {
  const { markets, holders, stats, mints } = useMarket();
  const images = Object.fromEntries((stats?.coins ?? []).map((c) => [c.mint, c.image]));

  return (
    <Wrap className="pt-16">
      <SectionTitle kicker="Pick a side" title="The Conferences" />
      <div className="grid gap-5 sm:grid-cols-2">
        {GROUP_COINS.map((c) => {
          const p = CONFERENCES[c.conference];
          const mint = mints.groups[c.id] ?? "";
          const m = markets[groupKey(c.id)];
          const h = holders[groupKey(c.id)];
          const img = mint ? images[mint] : null;
          const inner = (
            <>
              <div className="relative flex items-center gap-4 overflow-hidden p-5">
                <div aria-hidden="true" className="absolute -right-4 -top-6 font-display text-[130px] leading-none opacity-15">
                  {c.ticker}
                </div>
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" referrerPolicy="no-referrer" className="relative h-14 w-14 shrink-0 rounded-md border-2 border-chalk/40 object-cover" />
                )}
                <div className="relative min-w-0">
                  <div className="font-display text-[clamp(34px,4vw,48px)] uppercase leading-[0.9]">{c.name}</div>
                  <div className="mt-1 font-narrow text-sm font-bold uppercase tracking-[0.16em] opacity-85">{p.name}</div>
                  <span className="mt-2 inline-block rounded-sm bg-ink px-1.5 py-0.5 font-narrow text-[11px] font-bold uppercase tracking-[0.14em] text-amber">
                    ${c.ticker}
                    {!mint && " · Soon"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 border-t border-black/30 bg-ink text-chalk">
                <div className="px-3 py-2">
                  <Label className="text-chalk/60">Mkt cap</Label>
                  <div className="font-mono text-sm tabular-nums">{m ? fmtUsdShort(m.marketCap) : "Soon"}</div>
                </div>
                <div className="px-3 py-2">
                  <Label className="text-chalk/60">24h</Label>
                  <div className={`font-mono text-sm tabular-nums ${m ? changeColor(m.change24h) : ""}`}>{m ? fmtDir(m.change24h) : "—"}</div>
                </div>
                <div className="px-3 py-2">
                  <Label className="text-chalk/60">{h ? "Holders" : "Price"}</Label>
                  <div className="font-mono text-sm tabular-nums">{h ? fmtCompact(h.count) : m ? fmtUsd(m.priceUsd) : "—"}</div>
                </div>
              </div>
            </>
          );
          const cls = "block overflow-hidden rounded-xl border border-chalk/15 shadow-panel transition hover:-translate-y-0.5 hover:shadow-glow";
          const style = { background: `linear-gradient(135deg, ${p.color}, color-mix(in srgb, ${p.color} 55%, var(--color-ink)))`, color: p.on };
          return mint ? (
            <a key={c.id} href={pumpUrl(mint)} target="_blank" rel="noopener noreferrer" aria-label={`${c.name}: buy $${c.ticker} on pump.fun`} className={cls} style={style}>
              {inner}
            </a>
          ) : (
            <div key={c.id} className={cls} style={style}>
              {inner}
            </div>
          );
        })}
      </div>
    </Wrap>
  );
}
