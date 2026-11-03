import type { LaunchedCoin } from "./coins";

export const MAIN_KEY = "__main";
// Set in .env.development so `npm run dev` shows fake numbers; never set for production.
export const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

export type TokenMarket = {
  priceUsd: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  liquidityUsd: number;
};

export type Holders = { count: number; change24h: number | null };

export type EngineStats = {
  totalBurned: number;
  totalSolRouted: number;
  solToBurn: number;
  solToLp: number;
  solToMarketing: number;
  cycles: number;
  lastCycleAt: string | null;
  nextCycleAt: string | null;
  cycleIntervalMs: number;
  // When the claim process last wrote the file.
  capturedAt: string | null;
  // Optional holder counts, keyed by mint.
  holders: Record<string, Holders>;
  // Every coin the dev wallet launched, oldest first (see lib/coins.ts).
  coins: LaunchedCoin[];
};

export type Odds = {
  // Win probability, 0–1.
  p: number;
  // Change in probability points (0–1 scale) over the last day / week, when Polymarket reports it.
  day: number | null;
  week: number | null;
  // Market slug, for linking to the market on polymarket.com.
  slug: string | null;
};

type DexPair = {
  baseToken?: { address?: string };
  priceUsd?: string;
  priceChange?: { h24?: number };
  volume?: { h24?: number };
  marketCap?: number;
  fdv?: number;
  liquidity?: { usd?: number };
};

const DEX_API = "https://api.dexscreener.com/tokens/v1/solana/";
const DEX_BATCH = 30;

const num = (v: unknown, fallback = 0) => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
};
const numOrNull = (v: unknown) => {
  const n = num(v, NaN);
  return Number.isFinite(n) ? n : null;
};
const isoOrNull = (v: unknown) => (typeof v === "string" && !Number.isNaN(Date.parse(v)) ? v : null);

// Keyed by our own key (candidate id or MAIN_KEY), not by mint.
// Throws when every request fails, so callers keep the last good data instead of blanking it.
export async function fetchMarkets(entries: { key: string; mint: string }[]) {
  const byMint = new Map(entries.filter((e) => e.mint).map((e) => [e.mint, e.key]));
  const mints = [...byMint.keys()];
  const out: Record<string, TokenMarket> = {};
  let ok = 0;

  for (let i = 0; i < mints.length; i += DEX_BATCH) {
    const res = await fetch(DEX_API + mints.slice(i, i + DEX_BATCH).join(","));
    if (!res.ok) continue;
    ok++;
    const pairs: DexPair[] = await res.json();
    for (const p of pairs) {
      const key = byMint.get(p.baseToken?.address ?? "");
      if (!key) continue;
      const liq = num(p.liquidity?.usd);
      const vol = num(p.volume?.h24);
      const prev = out[key];
      // A coin can have a bonding-curve pair and a post-graduation pool: price from the deepest, volume summed.
      if (prev && prev.liquidityUsd >= liq) {
        prev.volume24h += vol;
        continue;
      }
      out[key] = {
        priceUsd: num(p.priceUsd),
        change24h: num(p.priceChange?.h24),
        volume24h: vol + (prev?.volume24h ?? 0),
        marketCap: num(p.marketCap ?? p.fdv),
        liquidityUsd: liq,
      };
    }
  }
  // DexScreener has no USD numbers for coins quoted in another token (candidates paired with
  // $PRESIDENT on the bonding curve); Jupiter prices those, so fill them from there.
  const unpriced = mints.filter((m) => !(out[byMint.get(m)!]?.priceUsd > 0));
  for (let i = 0; i < unpriced.length; i += JUP_BATCH) {
    try {
      const res = await fetch(JUP_API + unpriced.slice(i, i + JUP_BATCH).join(","));
      if (!res.ok) continue;
      ok++;
      const tokens: JupToken[] = await res.json();
      for (const t of tokens) {
        const key = byMint.get(t.id);
        if (!key || !num(t.usdPrice)) continue;
        out[key] = {
          priceUsd: num(t.usdPrice),
          change24h: num(t.stats24h?.priceChange),
          volume24h: num(t.stats24h?.buyVolume) + num(t.stats24h?.sellVolume),
          marketCap: num(t.mcap ?? t.fdv),
          liquidityUsd: num(t.liquidity),
        };
      }
    } catch {
      // Keep whatever DexScreener gave.
    }
  }
  if (mints.length && !ok) throw new Error("DexScreener unavailable");
  return out;
}

const JUP_API = "https://lite-api.jup.ag/tokens/v2/search?query=";
const JUP_BATCH = 50;
type JupToken = {
  id: string;
  usdPrice?: number;
  mcap?: number;
  fdv?: number;
  liquidity?: number;
  stats24h?: { priceChange?: number; buyVolume?: number; sellVolume?: number };
};

export function normalizeStats(raw: unknown): EngineStats | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const holders: Record<string, Holders> = {};
  if (r.holders && typeof r.holders === "object") {
    for (const [mint, h] of Object.entries(r.holders as Record<string, Record<string, unknown>>)) {
      const count = numOrNull(h?.count);
      if (count !== null) holders[mint] = { count, change24h: numOrNull(h?.change24h) };
    }
  }
  const interval = num(r.cycleIntervalMs, 3_600_000);
  const coins: LaunchedCoin[] = [];
  if (Array.isArray(r.coins)) {
    for (const c of r.coins as Record<string, unknown>[]) {
      if (typeof c?.mint !== "string" || !c.mint) continue;
      const str = (v: unknown) => (typeof v === "string" ? v : "");
      coins.push({ mint: c.mint, symbol: str(c.symbol), name: str(c.name), image: str(c.image) || null, main: c.main === true });
    }
  }
  return {
    coins,
    totalBurned: num(r.totalBurned),
    totalSolRouted: num(r.totalSolRouted),
    solToBurn: num(r.solToBurn),
    solToLp: num(r.solToLp),
    solToMarketing: num(r.solToMarketing),
    cycles: num(r.cycles),
    lastCycleAt: isoOrNull(r.lastCycleAt),
    nextCycleAt: isoOrNull(r.nextCycleAt),
    cycleIntervalMs: interval > 0 ? interval : 3_600_000,
    capturedAt: isoOrNull(r.capturedAt),
    holders,
  };
}

export async function fetchStats(url: string): Promise<EngineStats | null> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`stats ${res.status}`);
  return normalizeStats(await res.json());
}

const GAMMA_API = "https://gamma-api.polymarket.com/markets/keyset";

// Win odds per Polymarket market id.
export async function fetchOdds(ids: string[]) {
  const out: Record<string, Odds> = {};
  if (!ids.length) return out;
  const res = await fetch(`${GAMMA_API}?limit=100&${ids.map((id) => `id=${id}`).join("&")}`);
  if (!res.ok) throw new Error(`polymarket ${res.status}`);
  const body: {
    markets?: { id: string; slug?: string; outcomePrices?: string; oneDayPriceChange?: number; oneWeekPriceChange?: number }[];
  } = await res.json();
  for (const m of body.markets ?? []) {
    let yes = NaN;
    try {
      yes = Number(JSON.parse(m.outcomePrices ?? "[]")[0]);
    } catch {}
    if (Number.isFinite(yes))
      out[m.id] = { p: yes, day: numOrNull(m.oneDayPriceChange), week: numOrNull(m.oneWeekPriceChange), slug: m.slug ?? null };
  }
  return out;
}

// Stable fake numbers so the layout can be previewed before any coin is live.
export function seeded(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function demoMarkets(keys: string[]) {
  const out: Record<string, TokenMarket> = {};
  for (const key of keys) {
    const r = seeded(key);
    const marketCap = 3_000 + r() ** 3 * 600_000;
    out[key] = {
      marketCap,
      priceUsd: marketCap / 1e9,
      change24h: (r() - 0.4) * 90,
      volume24h: marketCap * r() * 0.8,
      liquidityUsd: marketCap * 0.15,
    };
  }
  return out;
}

export function demoHolders(keys: string[]) {
  const out: Record<string, Holders> = {};
  for (const key of keys) {
    const r = seeded(`holders:${key}`);
    out[key] = { count: Math.round(80 + r() ** 2 * 9000), change24h: Math.round((r() - 0.45) * 120) };
  }
  return out;
}

export function demoStats(): EngineStats {
  const hour = 3_600_000;
  const now = Date.now();
  const last = Math.floor(now / hour) * hour;
  return {
    totalBurned: 48_215_330,
    totalSolRouted: 812.4,
    solToBurn: 520.7,
    solToLp: 191.3,
    solToMarketing: 100.4,
    cycles: 214,
    lastCycleAt: new Date(last).toISOString(),
    nextCycleAt: new Date(last + hour).toISOString(),
    cycleIntervalMs: hour,
    capturedAt: new Date(last).toISOString(),
    holders: {},
    coins: [],
  };
}
