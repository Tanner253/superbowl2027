"use client";

import Link from "next/link";
import { useState } from "react";
import { PARTIES } from "@/config/candidates";
import { SITE } from "@/config/site";
import { changeColor, fmtDir, fmtOdds, fmtUsdShort } from "@/lib/format";
import { useCandidateRows, useMarket, type CandidateRow } from "@/lib/market-context";
import Avatar from "../Avatar";
import SectionTitle from "../SectionTitle";
import { Wrap } from "../ui";

const COLS = {
  name: { label: "Candidate", key: (r: CandidateRow) => r.name, text: true },
  odds: { label: "Odds", key: (r: CandidateRow) => r.odds ?? -1, text: false },
  mcap: { label: "Mkt cap", key: (r: CandidateRow) => r.market?.marketCap ?? -1, text: false },
  change: { label: "24h", key: (r: CandidateRow) => r.market?.change24h ?? -Infinity, text: false },
} as const;
type Col = keyof typeof COLS;

// WC's Golden Boot table, election-style: the top 8 in the race, sortable.
export default function FrontrunnerRace() {
  const rows = useCandidateRows();
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
        className={`flex items-center gap-1 font-narrow text-[11px] font-bold uppercase tracking-[0.22em] ${active ? "text-gold" : "text-cream/60 hover:text-cream"} ${cls}`}
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
          title="Frontrunner race"
          aside={
            <a href={SITE.polymarketEvent} target="_blank" rel="noopener noreferrer" className="font-narrow font-bold uppercase tracking-[0.16em] text-gold hover:text-cream">
              Polymarket ↗
            </a>
          }
        />
        <div className="border-[3px] border-cream bg-ink-2 shadow-brutal-gold">
          <div className={`${grid} border-b-[3px] border-gold bg-ink px-4 py-2.5`}>
            <span className="font-narrow text-[11px] font-bold uppercase tracking-[0.22em] text-cream/60">#</span>
            {head("name")}
            {head("odds", "justify-end")}
            {head("mcap", "hidden justify-end md:flex")}
            {head("change", "hidden justify-end md:flex")}
          </div>
          {!oddsLoaded
            ? Array.from({ length: 8 }, (_, i) => (
                <div key={i} className={`${grid} border-b border-cream/10 px-4 py-3 last:border-0`}>
                  <span className="skeleton h-5 w-5" />
                  <span className="skeleton h-5 w-40" />
                  <span className="skeleton h-5 w-12 justify-self-end" />
                </div>
              ))
            : sorted.map((r, i) => (
                <Link
                  key={r.id}
                  href={`/candidates/#${r.id}`}
                  className={`${grid} border-b border-cream/10 px-4 py-2.5 transition last:border-0 odd:bg-cream/[0.03] hover:bg-cream/[0.07]`}
                >
                  <span className={`font-slab text-lg ${i < 3 ? "text-gold" : "text-cream/60"}`}>{i + 1}</span>
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar c={r} size={36} />
                    <span className="min-w-0">
                      <span className="block truncate font-bold uppercase">{r.name}</span>
                      <span className="block font-narrow text-xs font-bold uppercase tracking-[0.14em]" style={{ color: r.party === "I" ? "var(--color-gold)" : r.party === "R" ? "var(--color-red-hot)" : "var(--color-sky)" }}>
                        {PARTIES[r.party].short} · ${r.ticker}
                      </span>
                    </span>
                  </span>
                  <span className="text-right font-slab text-lg tabular-nums text-gold">{fmtOdds(r.odds)}</span>
                  <span className="hidden text-right font-mono text-sm tabular-nums md:block">{r.market ? fmtUsdShort(r.market.marketCap) : "Soon"}</span>
                  <span className={`hidden text-right font-mono text-sm tabular-nums md:block ${changeColor(r.market?.change24h)}`}>
                    {r.market ? fmtDir(r.market.change24h) : "—"}
                  </span>
                </Link>
              ))}
        </div>
        <div className="mt-5 text-center">
          <Link href="/candidates/" className="font-narrow font-bold uppercase tracking-[0.16em] text-gold hover:text-cream">
            All {rows.length} candidates →
          </Link>
        </div>
      </Wrap>
    </section>
  );
}
