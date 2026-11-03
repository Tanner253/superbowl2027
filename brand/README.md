# $SUPERBOWL brand

Every image here is drawn in code by `render.js` (our own artwork: the badge, a night stadium, the
field and posts), with the site's fonts in `fonts/` (Anton and Barlow Condensed, SIL Open Font
License). No league, team or trophy artwork is used.

```bash
cd brand
npm install
node render.js
```

`render.js` writes:

| File | Size | Use |
| --- | --- | --- |
| `public/brand/superbowl-pfp-1024.png`, `-400.png` | 1024, 400 | Profile picture (X, Telegram, pump.fun image) |
| `public/brand/superbowl-banner-1500x500.png`, `-1200x400`, `-600x200` | 3:1 | X header and smaller banners |
| `public/brand/badge.png` | 512, transparent | The badge alone |
| `public/og.png` | 1200x630 | Share card (bump `?v=` in `src/lib/og.ts` after changing it, or X keeps the old one) |
| `src/app/icon.png`, `apple-icon.png`, `favicon.ico` | 512, 180, 16/32/48 | Site icons |

## X post graphic

```bash
node xpost.js
```

Reads the live numbers (burned total, coins, holders from `https://www.superbowl2027.fun/api/stats/`,
market cap and volume from DexScreener) and writes `out/x-post-burn.png` (1600x900) and
`out/x-post-caption.txt`. Override any field with JSON:

```bash
node xpost.js '{"kicker":"THE BIG GAME IS SUNDAY","burned":"48.2M"}'
```

Fields: `burned`, `pct`, `mcap`, `vol`, `holders`, `coins`, `lead`, `kicker`.

Caption format (emoji only in the caption; the brand fonts have none):

```
🔥 <burned> $SUPERBOWL burned so far (<pct> of the supply).

Every trade on every team coin pays a fee. Every 15 minutes the crank claims it and buys and burns $SUPERBOWL.

🏈 <coins> coins live · market cap <mcap>
superbowl2027.fun
```
