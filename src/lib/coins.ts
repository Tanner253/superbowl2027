import { TEAMS } from "@/config/candidates";
import { GROUP_COINS } from "@/config/parties";
import { SITE } from "@/config/site";

// Contract addresses come from the crank: it finds every coin the creator wallet launched and
// publishes the list with its stats (see /api/stats). Addresses typed into the config still win.

export type LaunchedCoin = { mint: string; symbol: string; name: string; image: string | null; main: boolean };

export type Mints = {
  main: string;
  // Team id → contract address.
  byId: Record<string, string>;
  // Team id → the launched coin's own ticker (shown instead of the config's).
  symbols: Record<string, string>;
  // Group coin id (afc, nfc) → contract address.
  groups: Record<string, string>;
  // At least one coin is live.
  any: boolean;
};

const norm = (s: string) => s.replace(/[^a-z0-9]/gi, "").toUpperCase();

const longest = (hits: { id: string; len: number }[]) => hits.sort((a, b) => b.len - a.len)[0]?.id ?? null;

// Which team a launched coin is: the team's full name inside the coin's name first (tickers get
// reused), else its ticker ($BILLS), else the team's ticker inside the coin's ticker ($GOBILLS).
// Longest match wins.
export function teamFor(coin: Pick<LaunchedCoin, "symbol" | "name">): string | null {
  const t = norm(coin.symbol);
  const n = norm(coin.name);
  const byName = longest(TEAMS.filter((c) => n && n.includes(norm(c.name))).map((c) => ({ id: c.id, len: norm(c.name).length })));
  if (byName) return byName;
  const exact = TEAMS.find((c) => norm(c.ticker) === t);
  if (exact) return exact.id;
  return longest(TEAMS.filter((c) => t && t.includes(norm(c.ticker))).map((c) => ({ id: c.id, len: c.ticker.length })));
}

// The conference coins match on their exact ticker or name ("AFC", "NFC") only.
const groupFor = (coin: Pick<LaunchedCoin, "symbol" | "name">) =>
  GROUP_COINS.find((g) => norm(coin.symbol) === norm(g.ticker) || norm(coin.name) === norm(g.name))?.id ?? null;

// `coins` come oldest first; if a team was launched twice the first coin wins (relaunches had
// less traction). Addresses typed into the config win over both.
export function resolveMints(coins: LaunchedCoin[]): Mints {
  let main = "";
  const byId: Record<string, string> = {};
  const symbols: Record<string, string> = {};
  const groups: Record<string, string> = {};
  const symbolOf: Record<string, string> = {};
  for (const c of coins) {
    symbolOf[c.mint] = c.symbol.replace(/^\$/, "").toUpperCase();
    if (c.main) main ||= c.mint;
    else {
      const g = groupFor(c);
      if (g) groups[g] ||= c.mint;
      else {
        const id = teamFor(c);
        if (id && !byId[id]) byId[id] = c.mint;
      }
    }
  }
  if (SITE.mainMint) main = SITE.mainMint;
  for (const c of TEAMS) if (c.mint) byId[c.id] = c.mint;
  for (const g of GROUP_COINS) if (g.mint) groups[g.id] = g.mint;
  for (const [id, mint] of Object.entries(byId)) if (symbolOf[mint]) symbols[id] = symbolOf[mint];
  return { main, byId, symbols, groups, any: Boolean(main) || Object.keys(byId).length > 0 || Object.keys(groups).length > 0 };
}

// Just the addresses typed into the config (before the crank's list loads).
export const CONFIG_MINTS = resolveMints([]);
