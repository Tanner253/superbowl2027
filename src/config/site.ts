// Everything you'd want to edit before launch lives in this folder.
import { CANDIDATES } from "./candidates";

export const SITE = {
  name: "US President 2028",
  ticker: "PRESIDENT",
  url: "https://www.president2028.fun",
  // Paste the $PRESIDENT contract address here once it's live on pump.fun.
  mainMint: "3LPTanzycRAjguU6VAXE7T2Fd12LePQLpHATXXs9pump",
  totalSupply: 1_000_000_000,
  electionDay: "2028-11-07T00:00:00-05:00",
  socials: [
    { label: "X", href: "" },
    { label: "Telegram", href: "" },
    { label: "TikTok", href: "" },
    { label: "Instagram", href: "" },
  ],
  // The crank's stats, served from MongoDB by the site's own read-only route (see README).
  statsUrl: "/api/stats/",
  polymarketEvent: "https://polymarket.com/event/presidential-election-winner-2028",
  // Polymarket's "Which party wins 2028" market: market ids for the two parties' YES prices.
  partyEvent: "https://polymarket.com/event/which-party-wins-2028-us-presidential-election",
  partyMarkets: { R: "565064", D: "565065" },
  marketRefreshMs: 60_000,
  oddsRefreshMs: 300_000,
};

// Optional banner under the home hero (giveaways, launches). Set to null to hide.
// Internal links (starting with "/") open in the same tab.
export const ANNOUNCEMENT: { tag: string; title: string; text?: string; ctas?: { label: string; href: string }[] } | null = {
  tag: "Call the race",
  title: "Pick the nominees and the next president.",
  text: "Build your ballot, share it, and see how it scores as the race plays out.",
  ctas: [{ label: "Make your ballot →", href: "/race/?view=ballot" }],
};

// "Call the race" ballot (WC's bracket challenge). Set prize to e.g.
// { winners: 10, solEach: 0.5, rules: "..." } to run a giveaway; null shows the game without a prize.
export const BALLOT: { prize: { winners: number; solEach: number; rules: string } | null } = {
  prize: null,
};

// Voter Card (WC's Passport): a holder leaderboard built from JSON the claim process publishes.
// Leave enabled false until those files exist; the page then shows a "rolls open at launch" state.
export const VOTER_CARD = {
  enabled: false,
  rosterUrl: "/data/roster/",
};

export const pumpUrl = (mint: string) => `https://pump.fun/coin/${mint}`;

const N = CANDIDATES.length;

export const ENGINE_STEPS = [
  {
    num: "01",
    title: "Claim",
    body: `Every cycle, creator fees are claimed across all ${N} candidate coins and the main $PRESIDENT coin.`,
  },
  {
    num: "02",
    title: "Buy & Burn",
    body: "A portion of the candidate-coin fees market-buys $PRESIDENT and permanently burns it, contracting circulating supply every cycle.",
  },
  {
    num: "03",
    title: "LP",
    body: "The rest, paired with a share of $PRESIDENT's own fees, is deposited into the $PRESIDENT liquidity pool to deepen on-chain liquidity.",
  },
  {
    num: "04",
    title: "Marketing",
    body: "Marketing is funded by a share of $PRESIDENT's own creator fees, plus the trading fees earned from the LP deposit, fueling giveaways, bounties and campaign-trail marketing.",
  },
] as const;

export const PAIRING = {
  title: "Every candidate is paired to $PRESIDENT",
  intro:
    "Candidate coins are paired to $PRESIDENT through the fee engine. Every trade on any candidate pays into the main coin.",
  points: [
    {
      title: "Constant buy pressure",
      body: "A portion of every candidate coin's fees market-buys $PRESIDENT, every cycle, no matter who is pumping.",
    },
    {
      title: "Shrinking supply",
      body: "Every $PRESIDENT the engine buys is burned. Supply only goes one way.",
    },
    {
      title: "Deeper liquidity",
      body: "The rest of the fees go into the $PRESIDENT pool, so bigger buys move the price less.",
    },
    {
      title: "The whole race in one coin",
      body: "Candidates rise and fall. $PRESIDENT collects from all of them, so whoever wins, $PRESIDENT wins.",
    },
    {
      title: "News is fuel",
      body: "Debates, polls, scandals and drop-outs move candidate coins. More trading means more fees and more burn.",
    },
  ],
};
