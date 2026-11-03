"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { OTHER_TEAMS, TEAMS, type Conference, type Team } from "@/config/candidates";
import { GROUP_COINS, groupKey } from "@/config/parties";
import { SITE } from "@/config/site";
import { CONFIG_MINTS, resolveMints, type Mints } from "./coins";
import {
  DEMO,
  MAIN_KEY,
  demoHolders,
  demoMarkets,
  demoStats,
  fetchMarkets,
  fetchOdds,
  fetchStats,
  type EngineStats,
  type Holders,
  type Odds,
  type TokenMarket,
} from "./market";

// A burn that landed since the page opened (the burned total went up between two refreshes).
export type BurnLanded = { amount: number; total: number; at: number };

type MarketState = {
  markets: Record<string, TokenMarket>;
  odds: Record<string, Odds>;
  // Keyed like markets (team id, group key or MAIN_KEY), resolved from stats.holders by mint.
  holders: Record<string, Holders>;
  stats: EngineStats | null;
  // Contract addresses: the config's, plus every coin the crank has found.
  mints: Mints;
  // First load attempt finished (whether or not it succeeded).
  loaded: boolean;
  oddsLoaded: boolean;
  // Last attempt failed; the data shown is the last good copy, if any.
  marketsFailed: boolean;
  statsFailed: boolean;
  lastBurn: BurnLanded | null;
};

const EMPTY: MarketState = {
  markets: {},
  odds: {},
  holders: {},
  stats: null,
  mints: CONFIG_MINTS,
  loaded: false,
  oddsLoaded: false,
  marketsFailed: false,
  statsFailed: false,
  lastBurn: null,
};

const Ctx = createContext<MarketState>(EMPTY);

const entriesFor = (m: Mints) => [
  { key: MAIN_KEY, mint: m.main },
  ...TEAMS.map((c) => ({ key: c.id, mint: m.byId[c.id] ?? "" })),
  ...GROUP_COINS.map((g) => ({ key: groupKey(g.id), mint: m.groups[g.id] ?? "" })),
];
const ODDS_IDS = [...TEAMS.flatMap((c) => (c.polymarketId ? [c.polymarketId] : [])), ...OTHER_TEAMS.map((t) => t.polymarketId)];

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MarketState>(EMPTY);

  useEffect(() => {
    let alive = true;
    // Last good stats, kept if a refresh fails.
    let lastStats: EngineStats | null = null;
    const loadMarkets = async () => {
      if (DEMO) {
        const keys = entriesFor(CONFIG_MINTS).map((e) => e.key);
        setState((s) => ({ ...s, markets: demoMarkets(keys), holders: demoHolders(keys), stats: demoStats(), loaded: true }));
        return;
      }
      // Stats first: they carry the coin list, which says which contract addresses to price.
      const st = await fetchStats(SITE.statsUrl).then(
        (v) => ({ ok: true, v }),
        () => ({ ok: false, v: null }),
      );
      const before = lastStats?.totalBurned ?? null;
      if (st.v) lastStats = st.v;
      const after = lastStats?.totalBurned ?? null;
      const landed = before !== null && after !== null && after > before ? { amount: after - before, total: after, at: Date.now() } : null;
      const mints = resolveMints(lastStats?.coins ?? []);
      const entries = entriesFor(mints);
      const m = await fetchMarkets(entries).then(
        (v) => ({ ok: true, v }),
        () => ({ ok: false, v: null }),
      );
      if (!alive) return;
      const holders: Record<string, Holders> = {};
      for (const e of entries) if (e.mint && lastStats?.holders[e.mint]) holders[e.key] = lastStats.holders[e.mint];
      setState((s) => ({
        ...s,
        markets: m.v ?? s.markets,
        stats: lastStats,
        mints,
        holders,
        loaded: true,
        marketsFailed: !m.ok,
        statsFailed: !st.ok,
        lastBurn: landed ?? s.lastBurn,
      }));
    };
    const loadOdds = async () => {
      const odds = await fetchOdds(ODDS_IDS).catch(() => null);
      if (alive) setState((s) => ({ ...s, odds: odds ?? s.odds, oddsLoaded: true }));
    };
    const tick = (fn: () => void) => () => {
      if (!document.hidden) fn();
    };
    const onVisible = () => {
      if (!document.hidden) {
        loadMarkets();
        loadOdds();
      }
    };
    loadMarkets();
    loadOdds();
    const t1 = setInterval(tick(loadMarkets), SITE.marketRefreshMs);
    const t2 = setInterval(tick(loadOdds), SITE.oddsRefreshMs);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      clearInterval(t1);
      clearInterval(t2);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useMarket = () => useContext(Ctx);

export type TeamRow = Team & {
  market: TokenMarket | null;
  // Title probability 0–1 and its day/week change in probability points (0–1 scale).
  odds: number | null;
  oddsDay: number | null;
  oddsWeek: number | null;
  holders: Holders | null;
  // This team's market on polymarket.com (or the event page until the slug loads).
  pmUrl: string;
};

export function useTeamRows(): TeamRow[] {
  const { markets, odds, holders, mints } = useMarket();
  return useMemo(
    () =>
      TEAMS.map((c) => {
        const o = c.polymarketId ? odds[c.polymarketId] : undefined;
        return {
          ...c,
          mint: mints.byId[c.id] ?? "",
          ticker: mints.symbols[c.id] ?? c.ticker,
          market: markets[c.id] ?? null,
          odds: o?.p ?? null,
          oddsDay: o?.day ?? null,
          oddsWeek: o?.week ?? null,
          holders: holders[c.id] ?? null,
          pmUrl: o?.slug ? `${SITE.polymarketEvent}/${o.slug}` : SITE.polymarketEvent,
        };
      }),
    [markets, odds, holders, mints],
  );
}

// Each conference's chance that the champion comes from it: the sum of its 16 teams' title odds
// on Polymarket, normalised so the two add up to 100%. null until loaded.
export function useConferenceOdds(): Record<Conference, number | null> {
  const { odds } = useMarket();
  return useMemo(() => {
    const sum = { AFC: 0, NFC: 0 };
    let seen = 0;
    for (const t of [...TEAMS, ...OTHER_TEAMS]) {
      const o = t.polymarketId ? odds[t.polymarketId] : undefined;
      if (!o) continue;
      sum[t.conference] += o.p;
      seen++;
    }
    const total = sum.AFC + sum.NFC;
    if (!seen || !total) return { AFC: null, NFC: null };
    return { AFC: sum.AFC / total, NFC: sum.NFC / total };
  }, [odds]);
}
