# Reusing this site for the next event

Every file and value the next event changes, in the order to change them. The crank has its own
`TEMPLATE.md`. Start from a fresh copy (no `.git`, `.vercel`, `node_modules`, `.next` or `out`).

## Safety renames (before anything is deployed)

| File | Value here | Change to |
| --- | --- | --- |
| `package.json`, `package-lock.json` | `"name": "superbowl2027"` | The new slug |
| `src/app/api/stats/route.ts` | `.db("superbowl2027")` and the comment above it | The new slug. A leftover name reads this project's live stats. |
| `src/config/site.ts` | `url: "https://www.superbowl2027.fun"` | The new domain |
| `src/config/site.ts` | `mainMint: ""` (filled in after launch) | `""` until the new main coin launches |
| `src/config/candidates.ts`, `src/config/parties.ts` | every `mint` | `""` |
| `src/lib/splash.ts` | `ENTERED_KEY = "sb27_entered"` | A new key, so returning visitors see the new splash |
| `src/components/TeamsView.tsx`, `road/Pickem.tsx`, `game/KickReturn.tsx` | `sb27_` localStorage keys | New prefixes |

Then search the copy for `superbowl2027`, `SUPERBOWL`, the main coin CA and the creator wallet. All must return nothing.

## Event content

| File | What it holds |
| --- | --- |
| `src/config/site.ts` | `SITE` (name, ticker, URL, `gameDay`, `gameName`, `venue`, Polymarket event), `ANNOUNCEMENT`, `BALLOT`, `VOTER_CARD`, and `ENGINE_STEPS` / `PAIRING`. Keep the fee engine and pairing copy word for word, swapping only names. |
| `src/config/candidates.ts` | The contenders (`TEAMS`): name, ticker, group, `polymarketId`, colours, status. `OTHER_TEAMS`: markets without coins that still count toward the group odds. `CONFERENCES`: the two groups. |
| `src/config/parties.ts` | The group coins (`GROUP_COINS`) |
| `src/config/race.ts` | `STAGES`, `CURRENT_STAGE`, `EVENTS` (the calendar) |
| `src/lib/race.ts` | `ROAD` (bracket columns) and the 3-slot pick game (`Ballot`, share code, scoring) |
| `src/lib/coins.ts` | How a launched coin is matched to a contender or group (full name first, then ticker) |
| `src/lib/market-context.tsx` | Which odds are fetched (`ODDS_IDS`) and the group odds sum (`useConferenceOdds`) |
| `src/config/voters.ts` | Fan Card tier and badge labels. Keep the JSON keys. |
| `src/components/home/*` | Home sections; `ConferenceBar.tsx` is the head-to-head bar, `Ticker.tsx` the headline line, `Scoreboard.tsx` the LED panels |
| `src/components/road/*`, `RoadView.tsx` | Bracket, calendar, pick game and its celebration |
| `src/components/TokenCard.tsx`, `TeamBadge.tsx` | Contender cards and badges (team colours, no logos) |
| `src/components/Footer.tsx`, `src/app/credits/page.tsx` | The not-affiliated line and data credits |
| `src/app/layout.tsx` | Fonts and the meta description |
| `src/app/*/page.tsx` | Route names and page titles; `src/components/Nav.tsx` and `Splash.tsx` list the routes |

## Theme and signature feature

| File | What it holds |
| --- | --- |
| `src/app/globals.css` | Colour tokens, textures (turf, yard lines, LED), keyframes, reduced-motion rules |
| `src/components/PageHero.tsx`, `ui.tsx`, `SectionTitle.tsx` | Shared look |
| `src/components/FieldGoalBackdrop.tsx` | The animated home background |
| `src/components/BurnCelebration.tsx` | What plays when a burn lands |
| `src/components/game/*` | The signature game: `GameProvider` (lazy mount in the root layout), `KickReturn` (window), `engine` (rules), `draw` and `sprites` (art) |
| `src/components/Badge.tsx` | The inline logo |

## Brand

| File | Change |
| --- | --- |
| `brand/render.js`, `brand/xpost.js`, `brand/fonts/` | Artwork, wording and fonts; then `node render.js` |
| `src/lib/og.ts` | Bump `?v=` on the share card |

## Deploy

1. `vercel link` → new project named after the slug, framework Next.js.
2. Production env: `MONGODB_URI` (read-only), optional `SOLANA_RPC_URL`. Never `NEXT_PUBLIC_DEMO`.
3. `vercel deploy --prod --yes`, then add the domain.
