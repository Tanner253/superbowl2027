/*
  Fan Card: a read-only leaderboard of every wallet on the 2027 roster.

  The claim process publishes these files under VOTER_CARD.rosterUrl (default /data/roster/),
  on the same cycle as the fee-engine stats, and stops updating them at the final whistle:

  board-meta.json
    { "totalEntries": 9966, "pageCount": 200, "pageSize": 50 }

  board-{n}.json   (n = 1 … pageCount, 1-based, 50 entries per page, ordered by rank)
    {
      "entries": [
        { "rank": 1, "owner": "<base58 wallet>", "band": "ELECTOR", "badges": ["REGISTERED", "STANDARD_BEARER"] }
      ],
      "resolvedResultBadges": ["NOMINEE"],          // optional, defaults to []
      "page": 1, "pageSize": 50, "totalEntries": 9966, "totalPages": 200   // optional echoes
    }

  - rank: 1-based and contiguous across pages. The score behind it stays private ("earlier and steadier ranks higher").
  - band: one of the TIERS keys below. The keys are President's, so the same claim process works unchanged.
  - badges: keys from BADGES, in canonical order. Every entry has REGISTERED.
  - resolvedResultBadges: result badges whose outcome is final. Until a result badge is listed here
    the page shows it unlit with "resolves …", whatever the entry says.
  - An optional "consistency" field per entry is accepted and ignored.

  Until board-meta.json exists (or while totalEntries is 0) the page shows the "roster opens at launch" state.
*/

export const PAGE_SIZE = 50;

// Low → high. Labels and blurbs can change freely; the JSON only carries the key.
export const TIERS = [
  { key: "VOTER", label: "Rookie", blurb: "Made the roster. Every wallet starts here.", pill: "text-chalk/60" },
  { key: "VOLUNTEER", label: "Starter", blurb: "Showed up and kept holding.", pill: "text-chalk/80" },
  { key: "ORGANIZER", label: "Pro Bowler", blurb: "Early and steady. Every week.", pill: "text-chalk" },
  { key: "DELEGATE", label: "All-Pro", blurb: "Near the top of the roster.", pill: "text-amber" },
  { key: "ELECTOR", label: "Hall of Famer", blurb: "The very top. Earliest and steadiest.", pill: "bg-amber px-1.5 text-ink" },
] as const;

export type TierKey = (typeof TIERS)[number]["key"];
export type Tier = (typeof TIERS)[number];

export const tierOf = (key: string): Tier | undefined => TIERS.find((t) => t.key === key);

type BadgeDef = {
  key: string;
  label: string;
  // How it's earned, shown in tooltips (standing badges) and in the explainer.
  how: string;
  kind: "standing" | "result" | "mystery";
  // Result badges only: tooltip text until the outcome is final.
  resolvesAt?: string;
};

// Canonical order: the badge strip always shows these slots in this order.
export const BADGES = [
  { key: "REGISTERED", label: "Season Ticket", how: "made the roster", kind: "standing" },
  { key: "STANDARD_BEARER", label: "Captain", how: "carried $superbowl", kind: "standing" },
  { key: "DIE_HARD", label: "Die-Hard", how: "held on after they were eliminated", kind: "standing" },
  { key: "BIG_TENT", label: "Front Office", how: "five teams, one wallet", kind: "standing" },
  {
    key: "NOMINEE",
    label: "Conference Champ",
    how: "held a conference champion when they were crowned",
    kind: "result",
    resolvesAt: "resolves Jan 31",
  },
  {
    key: "RUNNER_UP",
    label: "Runner-Up",
    how: "held the runner-up at the final whistle",
    kind: "result",
    resolvesAt: "resolves Feb 14",
  },
  {
    key: "PRESIDENT_ELECT",
    label: "Champion",
    how: "held the champion at the final whistle",
    kind: "result",
    resolvesAt: "resolves Feb 14",
  },
  { key: "MYSTERY", label: "?", how: "?", kind: "mystery" },
] as const satisfies readonly BadgeDef[];

export type BadgeKey = (typeof BADGES)[number]["key"];
export type Badge = (typeof BADGES)[number];

// Badges counted in the hero chip ("Badges 8") include the mystery slot.
export const BADGE_COUNT = BADGES.length;

export type RosterMeta = { totalEntries: number; pageCount: number; pageSize: number };

export type RosterEntry = { rank: number; owner: string; band: TierKey; badges: BadgeKey[] };

export type RosterPage = { page: number; entries: RosterEntry[]; resolvedResultBadges: BadgeKey[] };

// Is this badge lit for this entry? Unresolved result badges never are.
export function badgeLit(b: Badge, entry: RosterEntry, resolved: readonly string[]) {
  if (b.kind === "mystery") return false;
  if (!entry.badges.includes(b.key)) return false;
  return b.kind === "standing" || resolved.includes(b.key);
}

// Tooltip line: how a standing badge is earned, or where a result badge stands.
export function badgeLine(b: Badge, entry: RosterEntry, resolved: readonly string[]) {
  if (b.kind === "standing" || b.kind === "mystery") return b.how;
  if (!resolved.includes(b.key)) return b.resolvesAt;
  return entry.badges.includes(b.key) ? "earned" : "not earned";
}

// Solana addresses are 32–44 base58 characters (no 0, O, I or l).
export const isSolanaAddress = (s: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s);
