"use client";

import Link from "next/link";
import { useTeamRows, type TeamRow } from "@/lib/market-context";
import SectionTitle from "../SectionTitle";
import TokenCard from "../TokenCard";
import { Wrap } from "../ui";

type Pick = { r: TeamRow; label: string; tone: string };

// Top gainer & top loser over 24h. Before any coin is live, the biggest Polymarket odds
// movers over 7 days stand in, and failing that the two favorites.
function pickMovers(rows: TeamRow[]): { kicker: string; title: string; picks: Pick[] } {
  const live = rows.filter((r) => r.market);
  if (live.length >= 2) {
    const s = [...live].sort((a, b) => b.market!.change24h - a.market!.change24h);
    return {
      kicker: "Last 24 hours",
      title: "Top gainer & top loser",
      picks: [
        { r: s[0], label: "▲ Top gainer", tone: "bg-lime text-ink" },
        { r: s.at(-1)!, label: "▼ Top loser", tone: "bg-red-hot text-chalk" },
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
          { r: s.at(-1)!, label: "▼ Odds faller", tone: "bg-red-hot text-chalk" },
        ],
      };
  }
  const top = [...rows].sort((a, b) => (b.odds ?? -1) - (a.odds ?? -1));
  return {
    kicker: "Polymarket",
    title: "The favorites",
    picks: [
      { r: top[0], label: "◆ Title favorite", tone: "bg-amber text-ink" },
      { r: top[1], label: "Next in line", tone: "bg-chalk text-ink" },
    ],
  };
}

export default function Movers() {
  const { kicker, title, picks } = pickMovers(useTeamRows());
  return (
    <section className="py-14 sm:py-20">
      <Wrap>
        <SectionTitle
          kicker={kicker}
          title={title}
          aside={
            <Link href="/teams/" className="font-narrow font-bold uppercase tracking-[0.16em] text-amber hover:text-chalk">
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
              banner={<div className={`px-4 py-2 font-narrow text-sm font-bold uppercase tracking-[0.24em] ${tone}`}>{label}</div>}
            />
          ))}
        </div>
      </Wrap>
    </section>
  );
}
