"use client";

import { SITE } from "@/config/site";
import { fmtCompact, fmtNum, fmtUsd } from "@/lib/format";
import { useMarket } from "@/lib/market-context";
import { splitDuration, useNow } from "@/lib/useNow";
import FieldGoalBackdrop from "../FieldGoalBackdrop";
import { StatBlock, Wrap } from "../ui";
import Scoreboard from "./Scoreboard";

export default function Hero() {
  const { markets, stats, mints, loaded, statsFailed, marketsFailed } = useMarket();
  const now = useNow();
  const caps = Object.values(markets).map((m) => m.marketCap);
  const days = now === null ? null : splitDuration(Date.parse(SITE.gameDay) - now).days;

  const burned = !loaded ? null : stats ? (
    <>
      <span className="sm:hidden">{fmtCompact(stats.totalBurned)}</span>
      <span className="hidden sm:inline">{fmtNum(stats.totalBurned)}</span>
    </>
  ) : statsFailed && mints.any ? (
    "—"
  ) : (
    "Starts at launch"
  );
  const ecoCap = !loaded ? null : caps.length ? fmtUsd(caps.reduce((a, b) => a + b, 0)) : marketsFailed ? "—" : "Pre-launch";

  return (
    <section className="relative overflow-hidden border-b border-amber/40 bg-ink">
      <div aria-hidden="true" className="absolute inset-0">
        <FieldGoalBackdrop />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-ink/10" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
      </div>
      <Wrap className="relative py-10 sm:py-14">
        <div className="mb-8 max-w-3xl">
          <div className="font-narrow text-sm font-bold uppercase tracking-[0.32em] text-amber">
            {SITE.gameName}
            <span className="hidden sm:inline"> · {SITE.venue}</span>
          </div>
          <h1 className="flood-text mt-2 font-display text-[clamp(40px,8vw,96px)] uppercase leading-[0.88]">
            The season, <span className="whitespace-nowrap text-amber">on-chain.</span>
          </h1>
        </div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0">
            <Scoreboard />
          </div>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <StatBlock
              tone="led"
              label={`$${SITE.ticker} burned`}
              value={burned ?? <span className="skeleton inline-block h-10 w-48 align-middle">loading</span>}
              valueClass={typeof burned === "string" && burned.length > 3 ? "text-[clamp(24px,3vw,32px)] uppercase" : undefined}
            />
            <StatBlock
              tone="turf"
              label="Total ecosystem marketcap"
              value={ecoCap ?? <span className="skeleton inline-block h-10 w-40 align-middle">loading</span>}
              valueClass={ecoCap === "Pre-launch" ? "text-[clamp(24px,3vw,32px)] uppercase" : undefined}
            />
            <StatBlock
              tone="chalk"
              label="Days to kickoff"
              value={days === null ? "—" : days}
              sub={`${SITE.gameName} · Sun, Feb 14, 2027`}
              className="sm:col-span-2 lg:col-span-1"
            />
          </div>
        </div>
      </Wrap>
    </section>
  );
}
