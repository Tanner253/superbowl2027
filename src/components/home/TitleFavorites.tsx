"use client";

import Link from "next/link";
import { useState } from "react";
import { CONFERENCES } from "@/config/candidates";
import { SITE } from "@/config/site";
import { changeColor, fmtDir, fmtOdds, fmtUsdShort } from "@/lib/format";
import { useMarket, useTeamRows, type TeamRow } from "@/lib/market-context";
import SectionTitle from "../SectionTitle";
import TeamBadge from "../TeamBadge";
import { Wrap } from "../ui";

const COLS = {
  name: { label: "Team", key: (r: TeamRow) => r.name, text: true },
  odds: { label: "Odds", key: (r: TeamRow) => r.odds ?? -1, text: false },
  mcap: { label: "Mkt cap", key: (r: TeamRow) => r.market?.marketCap ?? -1, text: false },
  change: { label: "24h", key: (r: TeamRow) => r.market?.change24h ?? -Infinity, text: false },
} as const;
type Col = keyof typeof COLS;

// The power rankings: the top 8 title favorites, sortable.
export default function TitleFavorites() {
  const rows = useTeamRows();
  const { oddsLoaded } = useMarket();
  const [sort, setSort] = useState<{ col: Col; desc: boolean }>({ col: "odds", desc: true });

  const top8 = [...rows].sort((a, b) => (b.odds ?? -1) - (a.odds ?? -1)).slice(0, 8);
  const sorted = [...top8].sort((a, b) => {
    const c = COLS[sort.col];
    const x = c.key(a);
    const y = c.key(b);
    const d = typeof x === "string" ? x.localeCompare(y as string) : (x as number) - (y as number);
    return (sort.desc ? -d : d) || 0;
  });

  const head = (col: Col, cls = "") => {
    const active = sort.col === col;
    return (
      <button
        type="button"
        onClick={() => setSort((s) => ({ col, desc: s.col === col ? !s.desc : !COLS[col].text }))}
        className={`flex items-center gap-1 font-narrow text-[11px] font-bold uppercase tracking-[0.22em] ${active ? "text-amber" : "text-chalk/60 hover:text-chalk"} ${cls}`}
        aria-label={`Sort by ${COLS[col].label}`}
      >
        {COLS[col].label}
        {active && <span aria-hidden="true">{sort.desc ? "▼" : "▲"}</span>}
      </button>
    );
  };

  const grid = "grid grid-cols-[28px_minmax(0,1fr)_64px] items-center gap-3 md:grid-cols-[36px_minmax(0,1fr)_80px_100px_90px]";

  return (
    <section className="py-14 sm:py-20">
      <Wrap>
        <SectionTitle
          kicker="Live from Polymarket"
          title="Title favorites"
          aside={
            <a href={SITE.polymarketEvent} target="_blank" rel="noopener noreferrer" className="font-narrow font-bold uppercase tracking-[0.16em] text-amber hover:text-chalk">
              Polymarket ↗
            </a>
          }
        />
        <div className="panel overflow-hidden rounded-xl">
          <div className={`${grid} border-b border-amber/40 bg-ink px-4 py-2.5`}>
            <span className="font-narrow text-[11px] font-bold uppercase tracking-[0.22em] text-chalk/60">#</span>
            {head("name")}
            {head("odds", "justify-end")}
            {head("mcap", "hidden justify-end md:flex")}
            {head("change", "hidden justify-end md:flex")}
          </div>
          {!oddsLoaded
            ? Array.from({ length: 8 }, (_, i) => (
                <div key={i} className={`${grid} border-b border-chalk/10 px-4 py-3 last:border-0`}>
                  <span className="skeleton h-5 w-5" />
                  <span className="skeleton h-5 w-40" />
                  <span className="skeleton h-5 w-12 justify-self-end" />
                </div>
              ))
            : sorted.map((r, i) => (
                <Link
                  key={r.id}
                  href={`/teams/#${r.id}`}
                  className={`${grid} border-b border-chalk/10 px-4 py-2.5 transition last:border-0 odd:bg-chalk/[0.03] hover:bg-chalk/[0.07]`}
                >
                  <span className={`font-display text-xl ${i < 3 ? "text-amber" : "text-chalk/60"}`}>{i + 1}</span>
                  <span className="flex min-w-0 items-center gap-3">
                    <TeamBadge c={r} size={36} />
                    <span className="min-w-0">
                      <span className="block truncate font-bold uppercase">
                        <span className="sm:hidden">{r.nickname}</span>
                        <span className="hidden sm:inline">{r.name}</span>
                      </span>
                      <span className="block font-narrow text-xs font-bold uppercase tracking-[0.14em]" style={{ color: CONFERENCES[r.conference].text }}>
                        {r.conference} · ${r.ticker}
                      </span>
                    </span>
                  </span>
                  <span className="led-text text-right font-display text-xl tabular-nums">{fmtOdds(r.odds)}</span>
                  <span className="hidden text-right font-mono text-sm tabular-nums md:block">{r.market ? fmtUsdShort(r.market.marketCap) : "Soon"}</span>
                  <span className={`hidden text-right font-mono text-sm tabular-nums md:block ${changeColor(r.market?.change24h)}`}>
                    {r.market ? fmtDir(r.market.change24h) : "—"}
                  </span>
                </Link>
              ))}
        </div>
        <div className="mt-5 text-center">
          <Link href="/teams/" className="font-narrow font-bold uppercase tracking-[0.16em] text-amber hover:text-chalk">
            All {rows.length} teams →
          </Link>
        </div>
      </Wrap>
    </section>
  );
}
