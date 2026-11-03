import { BADGES, PAGE_SIZE, TIERS, type BadgeKey, type RosterEntry, type RosterMeta, type RosterPage } from "@/config/voters";
import { seeded } from "@/lib/market";

// Where the board reads from: the published JSON files, or an in-memory demo roster.
export type RosterSource = {
  // null when the rolls aren't published yet (missing file or totalEntries 0).
  meta(): Promise<RosterMeta | null>;
  page(n: number): Promise<RosterPage>;
};

const TIER_KEYS = new Set<string>(TIERS.map((t) => t.key));
const BADGE_KEYS = new Set<string>(BADGES.map((b) => b.key));
const int = (v: unknown) => (typeof v === "number" && Number.isInteger(v) && v >= 0 ? v : null);
const badgeList = (v: unknown) =>
  (Array.isArray(v) ? v : []).filter((k): k is BadgeKey => typeof k === "string" && BADGE_KEYS.has(k));

function normalizeMeta(raw: unknown): RosterMeta | null {
  const r = (raw ?? {}) as Record<string, unknown>;
  const totalEntries = int(r.totalEntries);
  if (!totalEntries) return null;
  const pageSize = int(r.pageSize) || PAGE_SIZE;
  const pageCount = int(r.pageCount) || Math.ceil(totalEntries / pageSize);
  return { totalEntries, pageCount, pageSize };
}

function normalizePage(raw: unknown, n: number): RosterPage {
  const r = (raw ?? {}) as Record<string, unknown>;
  if (!Array.isArray(r.entries)) throw new Error(`board-${n}: no entries`);
  const entries: RosterEntry[] = [];
  for (const e of r.entries as Record<string, unknown>[]) {
    const rank = int(e?.rank);
    if (!rank || typeof e.owner !== "string" || !e.owner) continue;
    const band = typeof e.band === "string" && TIER_KEYS.has(e.band) ? (e.band as RosterEntry["band"]) : "VOTER";
    entries.push({ rank, owner: e.owner, band, badges: badgeList(e.badges) });
  }
  return { page: n, entries, resolvedResultBadges: badgeList(r.resolvedResultBadges) };
}

export function remoteRoster(baseUrl: string): RosterSource {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const pages = new Map<number, Promise<RosterPage>>();
  return {
    async meta() {
      const res = await fetch(`${base}board-meta.json`, { cache: "no-store" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`board-meta ${res.status}`);
      // A host that answers a missing file with an HTML page means the rolls aren't published.
      const raw = await res.json().catch(() => null);
      return normalizeMeta(raw);
    },
    page(n) {
      let p = pages.get(n);
      if (!p) {
        // no-cache: revalidate every time so a page never lags behind board-meta.
        p = fetch(`${base}board-${n}.json`, { cache: "no-cache" })
          .then((res) => {
            if (!res.ok) throw new Error(`board-${n} ${res.status}`);
            return res.json();
          })
          .then((raw) => normalizePage(raw, n));
        // Failed pages are dropped so a retry refetches them.
        p.catch(() => pages.delete(n));
        pages.set(n, p);
      }
      return p;
    },
  };
}

// Scans pages 10 at a time for an exact owner match. Returns the entry and the page it's on.
export async function findOwner(source: RosterSource, meta: RosterMeta, owner: string) {
  for (let start = 1; start <= meta.pageCount; start += 10) {
    const batch = [];
    for (let n = start; n < start + 10 && n <= meta.pageCount; n++) batch.push(source.page(n));
    for (const p of await Promise.all(batch)) {
      const entry = p.entries.find((e) => e.owner === owner);
      if (entry) return { entry, page: p.page };
    }
  }
  return null;
}

// ---- Demo roster for `npm run dev` (NEXT_PUBLIC_DEMO=1): fake wallets, never shown in production.

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const DEMO_SIZE = 1_037;
// Cumulative share of the rolls at or above each tier, high → low.
const DEMO_CUTOFFS: [RosterEntry["band"], number][] = [
  ["ELECTOR", 0.0035],
  ["DELEGATE", 0.016],
  ["ORGANIZER", 0.11],
  ["VOLUNTEER", 0.35],
  ["VOTER", 1],
];

let demoEntries: RosterEntry[] | null = null;

function buildDemo() {
  const r = seeded("voter-roll");
  const out: RosterEntry[] = [];
  for (let rank = 1; rank <= DEMO_SIZE; rank++) {
    const len = r() < 0.7 ? 44 : 43;
    let owner = "";
    for (let i = 0; i < len; i++) owner += B58[Math.floor(r() * B58.length)];
    const pct = rank / DEMO_SIZE;
    const band = DEMO_CUTOFFS.find(([, cut]) => pct <= cut)![0];
    const top = 1 - pct;
    const badges: BadgeKey[] = ["REGISTERED"];
    if (r() < 0.6 + top * 0.35) badges.push("STANDARD_BEARER");
    if (r() < 0.06 + top * 0.12) badges.push("DIE_HARD");
    if (r() < 0.002 + top ** 6 * 0.08) badges.push("BIG_TENT");
    out.push({ rank, owner, band, badges });
  }
  return out;
}

export function demoRoster(): RosterSource {
  demoEntries ??= buildDemo();
  const all = demoEntries;
  const pageCount = Math.ceil(all.length / PAGE_SIZE);
  // A short delay so loading states are visible while previewing.
  const later = <T,>(v: T) => new Promise<T>((res) => setTimeout(() => res(v), 180));
  return {
    meta: () => later({ totalEntries: all.length, pageCount, pageSize: PAGE_SIZE }),
    page: (n) =>
      later({ page: n, entries: all.slice((n - 1) * PAGE_SIZE, n * PAGE_SIZE), resolvedResultBadges: [] }),
  };
}

// A real demo wallet, so the search can be tried in preview mode.
export function demoWallet(rank = 137) {
  demoEntries ??= buildDemo();
  return demoEntries[Math.min(rank, demoEntries.length) - 1].owner;
}
