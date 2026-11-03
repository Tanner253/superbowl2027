"use client";

import { TEAMS, isAlive } from "@/config/candidates";
import { nextDatedEvent } from "@/config/race";
import { SITE } from "@/config/site";
import { fmtOdds } from "@/lib/format";
import { useConferenceOdds, useMarket, useTeamRows, type TeamRow } from "@/lib/market-context";
import { splitDuration, useNow } from "@/lib/useNow";
import { nextCycleTarget } from "../Countdown";
import { LiveDot } from "../ui";

// The broadcast bottom line: a LIVE tag, rolling scores-style updates, and an Eastern Time clock.
export default function Ticker() {
  const rows = useTeamRows();
  const conf = useConferenceOdds();
  const { stats } = useMarket();
  const now = useNow();

  const headlines: React.ReactNode[] = [];
  if (conf.AFC !== null && conf.NFC !== null)
    headlines.push(
      <>
        Title odds · <span className="text-afc-hot">AFC {fmtOdds(conf.AFC)}</span> · <span className="text-nfc-hot">NFC {fmtOdds(conf.NFC)}</span>
      </>,
    );
  headlines.push(<>{TEAMS.filter(isAlive).length} teams alive · win or go home</>);
  if (now !== null) {
    const e = nextDatedEvent(now);
    if (e?.date) headlines.push(<>{splitDuration(Date.parse(`${e.date}T00:00:00-05:00`) - now).days} days to {e.title}</>);
    const burn = nextCycleTarget(stats?.nextCycleAt, stats?.cycleIntervalMs ?? 900_000, now);
    headlines.push(burn === null ? <>${SITE.ticker} burns start at launch</> : <>Next ${SITE.ticker} burn in {Math.ceil((burn - now) / 60000)} min</>);
  }

  // A headline after every few teams.
  const sorted = [...rows].sort((a, b) => (b.odds ?? -1) - (a.odds ?? -1));
  const items: React.ReactNode[] = [];
  sorted.forEach((r, i) => {
    if (i % 5 === 0 && headlines.length) items.push(<Headline key={`h${i}`}>{headlines[(i / 5) % headlines.length]}</Headline>);
    items.push(<Item key={r.id} r={r} />);
  });

  const clock =
    now === null ? "--:--" : new Date(now).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });

  return (
    <div className="relative flex h-12 items-stretch overflow-hidden border-b border-chalk/10 bg-night-2 font-narrow text-[15px] font-bold uppercase tracking-[0.1em]">
      <div className="relative z-10 flex shrink-0 items-center gap-2 bg-afc pl-4 pr-6 text-chalk [clip-path:polygon(0_0,100%_0,calc(100%-14px)_100%,0_100%)]">
        <LiveDot color="var(--color-chalk)" />
        Live
      </div>
      <div className="relative z-10 -ml-3 hidden shrink-0 items-center bg-amber pl-5 pr-5 text-ink [clip-path:polygon(14px_0,100%_0,calc(100%-14px)_100%,0_100%)] md:flex">
        Around the league
      </div>
      <div className="group relative min-w-0 flex-1 overflow-hidden" aria-hidden="true">
        <div className="marquee flex h-full w-max items-center group-hover:[animation-play-state:paused]">
          <div className="flex">{items}</div>
          <div className="flex">{items}</div>
        </div>
      </div>
      <div className="relative z-10 hidden shrink-0 items-center gap-1 border-l border-chalk/10 bg-ink px-4 tabular-nums text-chalk sm:flex">
        {clock} <span className="text-amber">ET</span>
      </div>
      <span className="sr-only">Live updates from the 2026 season and Polymarket title odds.</span>
    </div>
  );
}

function Headline({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap px-5 text-chalk">
      <span className="rounded-sm bg-chalk px-1.5 text-[12px] text-ink">Update</span>
      {children}
      <span className="pl-5 text-amber">◆</span>
    </span>
  );
}

function Item({ r }: { r: TeamRow }) {
  const delta = r.market ? r.market.change24h : r.oddsWeek !== null ? r.oddsWeek * 100 : null;
  return (
    <span className="flex items-center gap-2 whitespace-nowrap px-4">
      <span className="text-chalk">${r.ticker}</span>
      <span className="tabular-nums text-chalk/70">{fmtOdds(r.odds)}</span>
      {delta !== null && delta !== 0 && (
        <span className={`tabular-nums ${delta > 0 ? "text-lime" : "text-red-hot"}`}>
          {delta > 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}
          {r.market ? "%" : " pts"}
        </span>
      )}
      <span className="pl-4 text-chalk/25">|</span>
    </span>
  );
}
