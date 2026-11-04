// X post graphic: the burn so far, with live numbers. 1200x675 design, exported at 1600x900 to
// brand/out/x-post-burn.png, plus the caption to post with it.
//
//   node xpost.js                       live numbers from the site's /api/stats/ and DexScreener
//   node xpost.js '{"burned":"48.2M"}'  override any field (burned, pct, mcap, vol, holders, coins, lead, kicker)
//
// Brand fonts have no emoji, so emoji only ever go in the caption.
const fs = require("node:fs");
const path = require("node:path");
const { C, placeBadge, stadium, headline, label, render } = require("./render.js");

const SITE = "https://www.superbowl2027.fun";
const OUT = path.join(__dirname, "out");

const compact = (n) => Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n).toUpperCase();
const usd = (n) => `$${compact(n)}`;

async function live() {
  const stats = await fetch(`${SITE}/api/stats/`).then((r) => (r.ok ? r.json() : {}), () => ({}));
  const coins = Array.isArray(stats.coins) ? stats.coins : [];
  const main = coins.find((c) => c.main)?.mint;
  let mcap = null;
  let vol = null;
  if (main) {
    const pairs = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${main}`).then((r) => (r.ok ? r.json() : []), () => []);
    const best = [...pairs].sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
    if (best) {
      mcap = best.marketCap ?? best.fdv ?? null;
      vol = pairs.reduce((a, p) => a + (p.volume?.h24 ?? 0), 0);
    }
  }
  const burned = Number(stats.totalBurned) || 0;
  const holders = main && stats.holders?.[main]?.count;
  return {
    burned: compact(burned),
    pct: `${((burned / 1e9) * 100).toFixed(2)}%`,
    mcap: mcap ? usd(mcap) : "SOON",
    vol: vol ? usd(vol) : "SOON",
    holders: holders ? compact(holders) : "—",
    coins: String(coins.length || 0),
    cycles: Number(stats.cycles) || 0,
  };
}

const tile = (x, y, w, h, value, name) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${C.ink}" opacity="0.88"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="none" stroke="${C.amber}" stroke-opacity="0.45" stroke-width="2"/>
  <text x="${x + w / 2}" y="${y + 64}" text-anchor="middle" font-family="Anton" font-size="${value.length > 6 ? 32 : 40}" fill="${C.amber}">${value}</text>
  <text x="${x + w / 2}" y="${y + 98}" text-anchor="middle" font-family="Barlow Condensed" font-weight="700" font-size="18" letter-spacing="3" fill="${C.chalk}" opacity="0.75">${name}</text>`;

function xpost(d) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  ${stadium("x", 1200, 675, { horizon: 420, vx: 1010, lights: [0.6, 0.97] })}
  <rect width="1200" height="675" fill="${C.ink}" opacity="0.28"/>
  ${label(62, 74, 24, d.kicker || "SUPER BOWL 2027 · THE FEE ENGINE IS LIVE", C.amber)}
  ${headline("xh", 56, 232, 156, d.burned, C.amber)}
  ${headline("xs", 60, 300, 54, "$SUPERBOWL BURNED", C.chalk)}
  ${label(62, 350, 28, `${d.pct} OF THE SUPPLY · GONE FOR GOOD`, C.chalk, "start", 0.9)}
  ${tile(60, 392, 160, 118, d.mcap, "MARKET CAP")}
  ${tile(236, 392, 160, 118, d.vol, "24H VOLUME")}
  ${tile(412, 392, 160, 118, d.holders, "HOLDERS")}
  ${tile(588, 392, 160, 118, d.coins, "COINS LIVE")}
  ${placeBadge("xb", 1010, 170, 112)}
  <g font-family="Barlow Condensed" font-weight="700" font-size="30" letter-spacing="2" fill="${C.chalk}" text-anchor="middle">
    <text x="1010" y="335">EVERY TEAM COIN</text>
    <text x="1010" y="370">FEEDS THE BURN</text>
  </g>
  <text x="1010" y="418" text-anchor="middle" font-family="Anton" font-size="34" fill="${C.amber}">EVERY 5 MINUTES</text>
  ${label(62, 572, 22, d.lead || "16 TEAMS · AFC VS NFC · ONE CHAMPION · FEB 14, 2027", C.chalk, "start", 0.85)}
  <text x="62" y="622" font-family="Anton" font-size="38" letter-spacing="3" fill="${C.amber}">SUPERBOWL2027.FUN</text>
</svg>`;
}

function caption(d) {
  return [
    `🔥 ${d.burned} $SUPERBOWL burned so far (${d.pct} of the supply).`,
    "",
    "Every trade on every team coin pays a fee. Every 5 minutes the crank claims it and buys and burns $SUPERBOWL.",
    "",
    `🏈 ${d.coins} coins live · market cap ${d.mcap}`,
    "superbowl2027.fun",
  ].join("\n");
}

async function main() {
  const override = process.argv[2] ? JSON.parse(process.argv[2]) : {};
  const d = { ...(await live()), ...override };
  fs.mkdirSync(OUT, { recursive: true });
  render(xpost(d), path.join(OUT, "x-post-burn.png"), 1600);
  fs.writeFileSync(path.join(OUT, "x-post-caption.txt"), caption(d));
  console.log(`rendered out/x-post-burn.png\n\n${caption(d)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
