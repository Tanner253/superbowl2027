"use client";

import { SITE } from "@/config/site";
import { fmtCompact, fmtNum, fmtUsd } from "@/lib/format";
import { useMarket } from "@/lib/market-context";
import { splitDuration, useNow } from "@/lib/useNow";
import { StatBlock, Wrap } from "../ui";
import Scoreboard from "./Scoreboard";

export default function Hero() {
  const { markets, stats, mints, loaded, statsFailed, marketsFailed } = useMarket();
  const now = useNow();
  const caps = Object.values(markets).map((m) => m.marketCap);
  const days = now === null ? null : splitDuration(Date.parse(SITE.electionDay) - now).days;

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
    <section className="relative overflow-hidden border-b-4 border-gold bg-red">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="stars absolute inset-0" />
        <div className="absolute -left-40 -top-48 h-[520px] w-[520px] rounded-full bg-navy" />
        <div className="absolute -right-[12%] top-0 h-full w-[40%] -skew-x-12 bg-blue/70" />
        <div className="stripes absolute -right-[12%] bottom-10 h-5 w-[60%] -rotate-3 opacity-90" />
      </div>
      <Wrap className="relative py-10 sm:py-14">
        <h1 className="poster-shadow mb-8 font-slab text-[clamp(38px,7vw,84px)] uppercase leading-[0.88]">
          The race, <span className="text-gold">on-chain.</span>
        </h1>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0">
          <Scoreboard />
        </div>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <StatBlock
            tone="red"
            label={`$${SITE.ticker} burned`}
            value={burned ?? <span className="skeleton inline-block h-10 w-48 align-middle">loading</span>}
            valueClass={typeof burned === "string" && burned.length > 3 ? "text-[clamp(24px,3vw,32px)] uppercase" : undefined}
          />
          <StatBlock
            tone="gold"
            label="Total ecosystem marketcap"
            value={ecoCap ?? <span className="skeleton inline-block h-10 w-40 align-middle">loading</span>}
            valueClass={ecoCap === "Pre-launch" ? "text-[clamp(24px,3vw,32px)] uppercase" : undefined}
          />
          <StatBlock
            tone="cream"
            label="Days to Election Day"
            value={days === null ? "—" : days}
            sub="Tuesday · Nov 7, 2028"
            className="sm:col-span-2 lg:col-span-1"
          />
        </div>
        </div>
      </Wrap>
    </section>
  );
}
