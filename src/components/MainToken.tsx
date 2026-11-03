"use client";

import { SITE } from "@/config/site";
import { changeColor, fmtCompact, fmtDir, fmtNum, fmtSol, fmtUsd, timeAgo } from "@/lib/format";
import { DEMO, MAIN_KEY } from "@/lib/market";
import { useMarket } from "@/lib/market-context";
import { useNow } from "@/lib/useNow";
import BurnCam from "./BurnCam";
import BuyButton from "./BuyButton";
import CopyAddress from "./CopyAddress";
import { CycleTimer } from "./Countdown";
import PageHero from "./PageHero";
import SectionTitle from "./SectionTitle";
import { Label, StatBlock, Wrap } from "./ui";

export default function MainToken() {
  const { markets, holders, stats, mints, loaded } = useMarket();
  const now = useNow();
  const m = markets[MAIN_KEY];
  const h = holders[MAIN_KEY];
  const mint = mints.main;
  const pre = !mint;
  const burnedPct = stats ? (stats.totalBurned / SITE.totalSupply) * 100 : null;
  const routed = stats?.totalSolRouted ?? 0;
  const empty = pre ? "Soon" : loaded ? "—" : "";

  return (
    <>
      <PageHero
        variant="blue"
        kicker="The main coin"
        title={`$${SITE.ticker}`}
        titleClass="text-[clamp(40px,9vw,72px)] lg:text-[56px] xl:text-[80px]"
        subtitle="Every candidate coin's fees buy it and burn it. Watch the burn live."
        aside={
          <div className="w-full lg:w-[420px] xl:w-[520px]">
            <BurnCam />
          </div>
        }
      >
        <div className="mt-8 flex flex-col items-start gap-4">
          <BuyButton size="hero" />
          <CopyAddress address={mint} />
        </div>
      </PageHero>

      <Wrap className="pt-14">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4 border-b-[3px] border-cream/15 pb-6">
          <div>
            <Label className="text-gold">Market cap</Label>
            <div className="font-slab text-[clamp(40px,7vw,72px)] leading-none tabular-nums">{m ? fmtUsd(m.marketCap) : empty || "—"}</div>
            {m && (
              <div className={`mt-1 font-narrow text-lg font-bold tabular-nums ${changeColor(m.change24h)}`}>
                {fmtDir(m.change24h)} <span className="text-cream/60">(24H)</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <Label className="text-cream/70">24H volume</Label>
            <div className="font-slab text-[clamp(32px,5vw,52px)] leading-none tabular-nums">{m ? fmtUsd(m.volume24h) : empty || "—"}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatBlock label="Price" value={m ? fmtUsd(m.priceUsd) : empty || "—"} valueClass="text-[clamp(20px,3vw,30px)] break-all" />
          <StatBlock label="Liquidity" value={m ? fmtUsd(m.liquidityUsd) : empty || "—"} valueClass="text-[clamp(20px,3vw,30px)]" />
          <StatBlock
            label="Holders"
            value={h ? fmtNum(h.count) : empty || "—"}
            valueClass="text-[clamp(20px,3vw,30px)]"
            sub={h?.change24h != null ? <span className={changeColor(h.change24h)}>{h.change24h > 0 ? "▲" : h.change24h < 0 ? "▼" : "•"} {fmtNum(Math.abs(h.change24h))} 24h</span> : undefined}
          />
          <StatBlock
            tone="red"
            label="Supply burnt"
            value={burnedPct !== null && (stats!.cycles > 0 || stats!.totalBurned > 0) ? `${burnedPct.toFixed(2)}%` : pre ? "Soon" : "—"}
            valueClass="text-[clamp(20px,3vw,30px)]"
            sub={stats && stats.totalBurned > 0 ? `${fmtCompact(stats.totalBurned)} $${SITE.ticker}` : undefined}
          />
        </div>

        <div className="mt-8 border-4 border-cream bg-ink-2 shadow-brutal-md">
          <div className="flex items-center justify-between border-b-[3px] border-cream/20 px-4 py-2.5">
            <Label className="text-cream/80">Live chart</Label>
            <Label className="text-cream/50">via DexScreener</Label>
          </div>
          {mint && !DEMO ? (
            <iframe
              title={`$${SITE.ticker} price chart`}
              src={`https://dexscreener.com/solana/${mint}?embed=1&theme=dark&trades=0&info=0`}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-[360px] w-full bg-ink sm:h-[480px]"
            />
          ) : (
            <div className="relative h-[300px] overflow-hidden sm:h-[380px]">
              <svg aria-hidden="true" className="absolute inset-0 h-full w-full text-cream/10" preserveAspectRatio="none" viewBox="0 0 400 200">
                {[40, 80, 120, 160].map((y) => (
                  <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="currentColor" strokeDasharray="4 6" />
                ))}
                <polyline points="0,170 50,160 90,165 140,130 190,138 240,96 290,104 340,62 400,40" fill="none" stroke="rgb(233 185 73 / 0.25)" strokeWidth="3" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <div className="font-slab text-[clamp(24px,4vw,40px)] uppercase leading-none">Chart goes live at launch</div>
                <p className="mt-3 font-narrow font-bold uppercase tracking-[0.18em] text-cream/60">
                  {DEMO ? "Hidden in preview mode" : `When $${SITE.ticker} trades on pump.fun`}
                </p>
              </div>
            </div>
          )}
        </div>
      </Wrap>

      <Wrap className="pt-16">
        <SectionTitle
          kicker="On-chain, every cycle"
          title="Fee engine"
          aside={
            stats?.nextCycleAt ? (
              <div className="font-narrow font-bold uppercase tracking-[0.16em] text-cream/70">
                Next cycle in{" "}
                <span className="text-cream">
                  <CycleTimer next={stats.nextCycleAt} intervalMs={stats.cycleIntervalMs} />
                </span>
              </div>
            ) : null
          }
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatBlock tone="gold" label="SOL routed" value={stats && routed > 0 ? fmtSol(routed) : mints.any ? "—" : "Soon"} valueClass="text-[clamp(20px,3vw,30px)]" />
          <StatBlock tone="red" label="To buy & burn" value={stats && routed > 0 ? fmtSol(stats.solToBurn) : "—"} valueClass="text-[clamp(20px,3vw,30px)]" />
          <StatBlock label="To LP" value={stats && routed > 0 ? fmtSol(stats.solToLp) : "—"} valueClass="text-[clamp(20px,3vw,30px)]" />
          <StatBlock label="To marketing" value={stats && routed > 0 ? fmtSol(stats.solToMarketing) : "—"} valueClass="text-[clamp(20px,3vw,30px)]" />
        </div>
        {stats && routed > 0 && (
          <div className="mt-5 flex h-4 border-[3px] border-ink" role="img" aria-label="Where routed SOL went">
            <span className="bg-red-hot" style={{ width: `${(stats.solToBurn / routed) * 100}%` }} />
            <span className="bg-gold" style={{ width: `${(stats.solToLp / routed) * 100}%` }} />
            <span className="bg-sky" style={{ width: `${(stats.solToMarketing / routed) * 100}%` }} />
          </div>
        )}
        <p className="mt-4 font-narrow text-sm font-bold uppercase tracking-[0.16em] text-cream/55">
          {stats?.cycles ? `${fmtNum(stats.cycles)} cycles run` : "No cycles run yet"}
          {stats?.lastCycleAt && now !== null ? ` · last ${timeAgo(stats.lastCycleAt, now)}` : ""}
        </p>
      </Wrap>

      <section className="mt-16 border-y-4 border-ink bg-ink py-10">
        <Wrap className="flex justify-center">
          <BuyButton size="hero" />
        </Wrap>
      </section>
    </>
  );
}
