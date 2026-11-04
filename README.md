# Super Bowl 2027 ($SUPERBOWL)

The 2026 NFL season on-chain: one pump.fun coin for each of the 16 title favorites, an AFC and an NFC
coin, all feeding the main $SUPERBOWL coin through the fee engine, on the road to Super Bowl LXI
(Sunday, February 14, 2027, SoFi Stadium, Inglewood). Built from the US President 2028 site.

Live: https://www.superbowl2027.fun

Independent memecoin project. Not affiliated with the NFL, any team or any player. No league or team
logos, trophy artwork or player photos are used anywhere.

## Pages

| Route | What's on it |
| --- | --- |
| `/` | Splash gate, field-goal background, LED scoreboard (next round, next burn, teams alive, up next), burned / market cap / days to kickoff, buy band, ticker, AFC vs NFC bar, 4-step fee engine, "paired to $SUPERBOWL", top gainer & loser, title favorites |
| `/superbowl/` | Jumbotron burn cam, contract address, market cap / volume / price / liquidity / holders / % burnt, chart, fee-engine totals |
| `/teams/` | Ranked board (position, movement, odds, market cap, 24h, volume, holders), team cards, the conference coins |
| `/road/` | Road to the Super Bowl bracket, playoff calendar, Pick'em (AFC champion, NFC champion, winner) with share links |
| `/fans/` | Fan Card: holder leaderboard with 5 tiers, 8 badges, wallet lookup |
| `/credits/` | Where every live number comes from |

Kick Return, the signature game, opens from the nav on every page. It's mounted in the root layout
(`src/components/game/`), downloaded only on first open, and keeps its best score in the browser.

## Data sources

| What | Where it comes from |
| --- | --- |
| Coin price, market cap, volume, 24h change | DexScreener public API in the browser every 60s, with Jupiter for coins quoted in $SUPERBOWL |
| Title odds | Polymarket "Pro Football: 2027 Champion" (gamma `/markets/keyset`), every 5 min. Each team's market id is `polymarketId` in `src/config/candidates.ts` |
| AFC vs NFC | The same event: each conference's 16 team markets summed (the 16 teams without coins are `OTHER_TEAMS`) |
| Burned total | Read from the chain by `/api/stats` |
| SOL routed, LP and marketing totals, cycle times, holder counts, burn log, coin list | MongoDB, written every 5 minutes by the crank (private repo `superbowl2027-crank`), served by this site's read-only `/api/stats` route |
| Fan Card | `board-meta.json` + `board-{n}.json`, written by your internal claim process |

## Settings

| Variable | Where | Value |
| --- | --- | --- |
| `MONGODB_URI` | Vercel, Production | Read-only connection string for the `superbowl2027` database |
| `SOLANA_RPC_URL` | Vercel, optional | Helius URL. Falls back to the public RPC. |
| `NEXT_PUBLIC_DEMO` | `.env.development` only | `1` shows fake numbers in `npm run dev`. Never set it in production. |

## Launch checklist

1. **Main coin:** paste the $SUPERBOWL contract address into `mainMint` in `src/config/site.ts`. Until then the crank's coin list fills it in by ticker.
2. **Team and conference coins:** nothing to paste. The crank publishes every coin the creator wallet launched, and the site matches each on full team name first, then ticker (`src/lib/coins.ts`). An address typed into `mint` in `src/config/candidates.ts` or `src/config/parties.ts` still wins. Until a coin is live its card says "Soon".
3. **Socials:** fill in `socials` in `src/config/site.ts`; empty links stay hidden.
4. **Giveaway (optional):** set `BALLOT.prize` in `src/config/site.ts` to show winners × SOL and rules on the Pick'em. Edit or remove the home `ANNOUNCEMENT` band there too.
5. **Database:** add `MONGODB_URI` (read-only user) to the Vercel project's Production environment variables.
6. **Deploy:** `vercel deploy --prod --yes`.

## Fee-engine stats (MongoDB)

The crank saves one document (`_id: "current"`) in the `stats` collection of the `superbowl2027`
database after every cycle. `/api/stats/` returns it (call it with the trailing slash), cached for 30
seconds at Vercel's edge, with `totalBurned` read straight from the chain:

```json
{
  "totalBurned": 0,
  "totalSolRouted": 0,
  "solToBurn": 0,
  "solToLp": 0,
  "solToMarketing": 0,
  "cycles": 0,
  "lastCycleAt": null,
  "nextCycleAt": null,
  "cycleIntervalMs": 300000,
  "capturedAt": null,
  "holders": { "<mint>": { "count": 1049, "change24h": -30 } },
  "coins": [{ "mint": "<mint>", "symbol": "BILLS", "name": "Buffalo Bills", "image": null, "main": false }]
}
```

- `totalBurned` is in $SUPERBOWL tokens; the SOL fields are in SOL; times are ISO strings.
- When the burned total rises between two refreshes, the page shows the touchdown banner.
- Until `nextCycleAt` is set, the site shows "Burns start at launch" instead of a countdown.

## Fan Card files

The schema is documented at the top of `src/config/voters.ts` (keys are President's, so the same claim
process works unchanged). Host them at `VOTER_CARD.rosterUrl`, then set `VOTER_CARD.enabled: true` in
`src/config/site.ts`. Until then, the page shows "The roster opens when $SUPERBOWL launches".

## Running the season

- **A team is eliminated:** set `status: "out"`, `outAt` (the round they lost: `"season"`, `"wildcard"`, `"divisional"`, `"conference"`) and optionally `outDate: "2027-01-17"` in `src/config/candidates.ts`. They're greyed out everywhere, stop on the bracket at that round, and appear in the calendar.
- **Conference champions:** set `status: "nominee"`. **Champion:** `status: "winner"`. Pick'em cards score automatically.
- **The season moves on:** set `CURRENT_STAGE` in `src/config/race.ts`.
- **Calendar:** date or add games in `EVENTS` in `src/config/race.ts`, and set `result` once one is decided. Set `SITE.gameDay` once the kickoff time is announced.
- **After the Super Bowl:** keep the crank running and mark the champion.

## Brand

`brand/` renders the logo, banners, icons, share card and X post graphic. See `brand/README.md`.
