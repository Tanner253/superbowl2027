"use client";

import { CANDIDATES, isAlive } from "@/config/candidates";
import { nextDatedEvent } from "@/config/race";
import { SITE } from "@/config/site";
import { fmtOdds } from "@/lib/format";
import { useCandidateRows, useMarket, usePartyOdds, type CandidateRow } from "@/lib/market-context";
import { splitDuration, useNow } from "@/lib/useNow";
import { nextCycleTarget } from "../Countdown";
import { LiveDot } from "../ui";

// Cable-news lower third: BREAKING tag, rolling headlines, and an Eastern Time clock.
export default function Chyron() {
  const rows = useCandidateRows();
  const party = usePartyOdds();
  const { stats } = useMarket();
  const now = useNow();

  const headlines: React.ReactNode[] = [];
  if (party.R !== null && party.D !== null)
    headlines.push(
      <>
        Party odds · <span className="text-red-hot">GOP {fmtOdds(party.R)}</span> · <span className="text-sky">DEM {fmtOdds(party.D)}</span>
      </>,
    );
  headlines.push(<>{CANDIDATES.filter(isAlive).length} candidates remain · drop out and go home</>);
  if (now !== null) {
    const e = nextDatedEvent(now);
    if (e?.date) headlines.push(<>{splitDuration(Date.parse(`${e.date}T00:00:00-05:00`) - now).days} days to {e.title}</>);
    const burn = nextCycleTarget(stats?.nextCycleAt, stats?.cycleIntervalMs ?? 3_600_000, now);
    headlines.push(burn === null ? <>${SITE.ticker} burns start at launch</> : <>Next ${SITE.ticker} burn in {Math.ceil((burn - now) / 60000)} min</>);
  }

  // A headline after every few candidates.
  const sorted = [...rows].sort((a, b) => (b.odds ?? -1) - (a.odds ?? -1));
  const items: React.ReactNode[] = [];
  sorted.forEach((r, i) => {
    if (i % 5 === 0 && headlines.length) items.push(<Headline key={`h${i}`}>{headlines[(i / 5) % headlines.length]}</Headline>);
    items.push(<Item key={r.id} r={r} />);
  });

  const clock =
    now === null ? "--:--" : new Date(now).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });

  return (
    <div className="relative flex h-12 items-stretch overflow-hidden border-y-4 border-ink bg-navy-2 font-narrow text-[15px] font-bold uppercase tracking-[0.1em]">
      <div className="relative z-10 flex shrink-0 items-center gap-2 bg-red pl-4 pr-6 text-cream [clip-path:polygon(0_0,100%_0,calc(100%-14px)_100%,0_100%)]">
        <LiveDot color="var(--color-cream)" />
        Breaking
      </div>
      <div className="relative z-10 -ml-3 hidden shrink-0 items-center bg-gold pl-5 pr-5 text-ink [clip-path:polygon(14px_0,100%_0,calc(100%-14px)_100%,0_100%)] md:flex">
        Decision desk
      </div>
      <div className="group relative min-w-0 flex-1 overflow-hidden" aria-hidden="true">
        <div className="marquee flex h-full w-max items-center group-hover:[animation-play-state:paused]">
          <div className="flex">{items}</div>
          <div className="flex">{items}</div>
        </div>
      </div>
      <div className="relative z-10 hidden shrink-0 items-center gap-1 border-l-4 border-ink bg-ink px-4 tabular-nums text-cream sm:flex">
        {clock} <span className="text-gold">ET</span>
      </div>
      <span className="sr-only">Live headlines from the 2028 race and Polymarket odds.</span>
    </div>
  );
}

function Headline({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap px-5 text-cream">
      <span className="bg-cream px-1.5 text-[12px] text-ink">Update</span>
      {children}
      <span className="pl-5 text-gold">★</span>
    </span>
  );
}

function Item({ r }: { r: CandidateRow }) {
  const delta = r.market ? r.market.change24h : r.oddsWeek !== null ? r.oddsWeek * 100 : null;
  return (
    <span className="flex items-center gap-2 whitespace-nowrap px-4">
      <span className="text-cream">${r.ticker}</span>
      <span className="tabular-nums text-cream/70">{fmtOdds(r.odds)}</span>
      {delta !== null && delta !== 0 && (
        <span className={`tabular-nums ${delta > 0 ? "text-lime" : "text-red-hot"}`}>
          {delta > 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}
          {r.market ? "%" : " pts"}
        </span>
      )}
      <span className="pl-4 text-cream/25">|</span>
    </span>
  );
}
