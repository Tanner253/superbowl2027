// Everything you'd want to edit before launch lives in this folder.
import { TEAMS } from "./candidates";

export const SITE = {
  name: "Super Bowl 2027",
  ticker: "SUPERBOWL",
  url: "https://www.superbowl2027.fun",
  // Paste the $SUPERBOWL contract address here once it's live on pump.fun.
  mainMint: "92j5cWKjdVKDC7skBw1HjvYtrTU8nMM1zKjC4dqmpump",
  totalSupply: 1_000_000_000,
  // Super Bowl LXI. Midnight Eastern until the kickoff time is announced.
  gameDay: "2027-02-14T00:00:00-05:00",
  gameName: "Super Bowl LXI",
  venue: "SoFi Stadium · Inglewood",
  socials: [
    { label: "X", href: "https://x.com/SuperbowlOnPump" },
    { label: "Telegram", href: "" },
    { label: "TikTok", href: "" },
    { label: "Instagram", href: "" },
  ],
  // The crank's stats, served from MongoDB by the site's own read-only route (see README).
  statsUrl: "/api/stats/",
  // Polymarket's "Pro Football: 2027 Champion" event: one market per team. Conference odds are the
  // sum of each conference's 32 team markets (see OTHER_TEAMS).
  polymarketEvent: "https://polymarket.com/event/pro-football-2027-champion-20260729185915366",
  marketRefreshMs: 60_000,
  oddsRefreshMs: 300_000,
};

// Optional banner under the home hero (giveaways, launches). Set to null to hide.
// Internal links (starting with "/") open in the same tab.
export const ANNOUNCEMENT: { tag: string; title: string; text?: string; ctas?: { label: string; href: string }[] } | null = {
  tag: "Pick'em",
  title: "Call both conference champions and the winner.",
  text: "Make your picks, share them, and see how they score as the playoffs play out.",
  ctas: [{ label: "Make your picks →", href: "/road/?view=pickem" }],
};

// The Pick'em game. Set prize to e.g. { winners: 10, solEach: 0.5, rules: "..." } to run a
// giveaway; null shows the game without a prize.
export const BALLOT: { prize: { winners: number; solEach: number; rules: string } | null } = {
  prize: null,
};

// Fan Card: a holder leaderboard built from JSON the claim process publishes.
// Leave enabled false until those files exist; the page then shows a "roster opens at launch" state.
export const VOTER_CARD = {
  enabled: false,
  rosterUrl: "/data/roster/",
};

export const pumpUrl = (mint: string) => `https://pump.fun/coin/${mint}`;

const N = TEAMS.length;

export const ENGINE_STEPS = [
  {
    num: "01",
    title: "Claim",
    body: `Every cycle, creator fees are claimed across all ${N} team coins and the main $SUPERBOWL coin.`,
  },
  {
    num: "02",
    title: "Buy & Burn",
    body: "A portion of the team-coin fees market-buys $SUPERBOWL and permanently burns it, contracting circulating supply every cycle.",
  },
  {
    num: "03",
    title: "LP",
    body: "The rest, paired with a share of $SUPERBOWL's own fees, is deposited into the $SUPERBOWL liquidity pool to deepen on-chain liquidity.",
  },
  {
    num: "04",
    title: "Marketing",
    body: "Marketing is funded by a share of $SUPERBOWL's own creator fees, plus the trading fees earned from the LP deposit, fueling giveaways, bounties and game-day marketing.",
  },
] as const;

export const PAIRING = {
  title: "Every team is paired to $SUPERBOWL",
  intro: "Team coins are paired to $SUPERBOWL through the fee engine. Every trade on any team pays into the main coin.",
  points: [
    {
      title: "Constant buy pressure",
      body: "A portion of every team coin's fees market-buys $SUPERBOWL, every cycle, no matter who is pumping.",
    },
    {
      title: "Shrinking supply",
      body: "Every $SUPERBOWL the engine buys is burned. Supply only goes one way.",
    },
    {
      title: "Deeper liquidity",
      body: "The rest of the fees go into the $SUPERBOWL pool, so bigger buys move the price less.",
    },
    {
      title: "The whole race in one coin",
      body: "Teams rise and fall. $SUPERBOWL collects from all of them, so whoever wins, $SUPERBOWL wins.",
    },
    {
      title: "News is fuel",
      body: "Games, injuries, upsets and playoff exits move team coins. More trading means more fees and more burn.",
    },
  ],
};
