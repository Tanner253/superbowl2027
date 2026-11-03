"use client";

import Link from "next/link";
import { useCandidateRows, type CandidateRow } from "@/lib/market-context";
import SectionTitle from "../SectionTitle";
import TokenCard from "../TokenCard";
import { Wrap } from "../ui";

type Pick = { r: CandidateRow; label: string; tone: string };

// Top gainer & top loser over 24h. Before any coin is live, the biggest Polymarket odds
// movers over 7 days stand in, and failing that the two frontrunners.
function pickMovers(rows: CandidateRow[]): { kicker: string; title: string; picks: Pick[] } {
  const live = rows.filter((r) => r.market);
  if (live.length >= 2) {
    const s = [...live].sort((a, b) => b.market!.change24h - a.market!.change24h);
    return {
      kicker: "Last 24 hours",
      title: "Top gainer & top loser",
      picks: [
        { r: s[0], label: "▲ Top gainer", tone: "bg-lime text-ink" },
        { r: s.at(-1)!, label: "▼ Top loser", tone: "bg-red-hot text-cream" },
      ],
    };
  }
  const moved = rows.filter((r) => r.oddsWeek !== null && r.oddsWeek !== 0);
  if (moved.length >= 2) {
    const s = [...moved].sort((a, b) => b.oddsWeek! - a.oddsWeek!);
    if (s[0].oddsWeek! > 0 && s.at(-1)!.oddsWeek! < 0)
      return {
        kicker: "Polymarket · last 7 days",
        title: "Biggest odds movers",
        picks: [
          { r: s[0], label: "▲ Odds riser", tone: "bg-lime text-ink" },
          { r: s.at(-1)!, label: "▼ Odds faller", tone: "bg-red-hot text-cream" },
        ],
      };
  }
  const top = [...rows].sort((a, b) => (b.odds ?? -1) - (a.odds ?? -1));
  return {
    kicker: "Polymarket",
    title: "The frontrunners",
    picks: [
      { r: top[0], label: "★ Frontrunner", tone: "bg-gold text-ink" },
      { r: top[1], label: "Runner-up", tone: "bg-cream text-ink" },
    ],
  };
}

export default function Movers() {
  const { kicker, title, picks } = pickMovers(useCandidateRows());
  return (
    <section className="py-14 sm:py-20">
      <Wrap>
        <SectionTitle
          kicker={kicker}
          title={title}
          aside={
            <Link href="/candidates/" className="font-narrow font-bold uppercase tracking-[0.16em] text-gold hover:text-cream">
              See all →
            </Link>
          }
        />
        <div className="grid gap-6 md:grid-cols-2">
          {picks.map(({ r, label, tone }) => (
            <TokenCard
              key={label}
              r={r}
              fallback="board"
              banner={<div className={`border-b-[3px] border-cream px-4 py-2 font-narrow text-sm font-bold uppercase tracking-[0.24em] ${tone}`}>{label}</div>}
            />
          ))}
        </div>
      </Wrap>
    </section>
  );
}
