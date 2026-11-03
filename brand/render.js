// Renders the $SUPERBOWL brand images (PFP, banners, share card, badge, site icons) from SVG with the
// site's fonts. Run from this folder: npm install && node render.js. Everything is drawn here, by us:
// no league, team or trophy artwork.
const { Resvg } = require("@resvg/resvg-js");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const BRAND = path.join(ROOT, "public", "brand");
const FONTS = ["Anton-Regular.ttf", "BarlowCondensed-Bold.ttf", "BarlowCondensed-SemiBold.ttf"].map((f) => path.join(__dirname, "fonts", f));

const C = {
  ink: "#04080f",
  night: "#08111f",
  night2: "#0c1a2e",
  night3: "#132743",
  turf: "#0c4426",
  turf2: "#11602f",
  turf3: "#188041",
  chalk: "#f4f7f2",
  amber: "#ffc23d",
  flood: "#fff3cf",
  afc: "#c8102e",
  nfc: "#1f4fd1",
  post: "#ffd447",
};

// The badge, in a 200 box centred at 100,100: football on a floodlit field, ticker and year.
function badge(id) {
  const laces = [90, 96, 102, 108].map((x) => `<path d="M${x} 95.5v9" stroke="${C.chalk}" stroke-width="2.6" stroke-linecap="round"/>`).join("");
  const stripes = [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${40 + i * 20}" y="40" width="10" height="120" fill="${C.turf}" opacity="0.55"/>`).join("");
  const lines = [64, 82, 100, 118, 136].map((x) => `<rect x="${x - 0.8}" y="40" width="1.6" height="120" fill="${C.chalk}" opacity="0.5"/>`).join("");
  return `
  <defs>
    <path id="${id}-top" d="M 38 100 A 62 62 0 0 1 162 100"/>
    <path id="${id}-bot" d="M 21 100 A 79 79 0 0 0 179 100"/>
    <clipPath id="${id}-disc"><circle cx="100" cy="100" r="52"/></clipPath>
    <radialGradient id="${id}-glow" cx="0.5" cy="0.15" r="0.75">
      <stop offset="0" stop-color="${C.flood}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${C.flood}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="100" cy="100" r="96" fill="${C.amber}" stroke="${C.ink}" stroke-width="4"/>
  <circle cx="100" cy="100" r="86" fill="${C.night2}" stroke="${C.ink}" stroke-width="3"/>
  <text font-family="Anton" font-size="19" letter-spacing="2.4" fill="${C.amber}"><textPath href="#${id}-top" startOffset="50%" text-anchor="middle">$SUPERBOWL</textPath></text>
  <text font-family="Anton" font-size="17" letter-spacing="5" fill="${C.chalk}"><textPath href="#${id}-bot" startOffset="50%" text-anchor="middle">2027</textPath></text>
  <circle cx="30" cy="100" r="3.2" fill="${C.amber}"/>
  <circle cx="170" cy="100" r="3.2" fill="${C.amber}"/>
  <circle cx="100" cy="100" r="55" fill="${C.chalk}" stroke="${C.ink}" stroke-width="3"/>
  <g clip-path="url(#${id}-disc)">
    <rect x="40" y="40" width="120" height="120" fill="${C.turf2}"/>
    ${stripes}${lines}
    <circle cx="100" cy="100" r="52" fill="url(#${id}-glow)"/>
  </g>
  <g transform="rotate(-32 100 100)">
    <ellipse cx="102" cy="104" rx="34" ry="20" fill="${C.ink}" opacity="0.45"/>
    <ellipse cx="100" cy="100" rx="34" ry="20" fill="#8a3b12" stroke="${C.ink}" stroke-width="3"/>
    <path d="M70 100a30 16 0 0 1 60 0" fill="none" stroke="#b25a22" stroke-width="5" opacity="0.55"/>
    <path d="M76 88v24M124 88v24" stroke="${C.chalk}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M86 100h28" stroke="${C.chalk}" stroke-width="3" stroke-linecap="round"/>
    ${laces}
  </g>`;
}

// The badge placed with its centre at (cx, cy) and outer radius r.
const placeBadge = (id, cx, cy, r) => `<g transform="translate(${cx - r * 1.0417} ${cy - r * 1.0417}) scale(${(r * 2.0833) / 200})">${badge(id)}</g>`;

// A night stadium: sky, stands, floodlights, and the field running away to a vanishing point.
// The field covers y from `horizon` to h; posts (optional) stand at (px, horizon).
function stadium(id, w, h, { horizon = h * 0.5, vx = w / 2, posts = null, lights = [0.06, 0.3, 0.7, 0.94] } = {}) {
  let s = `
  <defs>
    <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#02050b"/><stop offset="1" stop-color="#0f1f37"/>
    </linearGradient>
    <linearGradient id="${id}-fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.night}" stop-opacity="0.95"/><stop offset="0.35" stop-color="${C.night}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="${id}-flood" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${C.flood}" stop-opacity="0.45"/><stop offset="0.35" stop-color="${C.flood}" stop-opacity="0.1"/><stop offset="1" stop-color="${C.flood}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${id}-pool" cx="0.5" cy="1" r="0.8">
      <stop offset="0" stop-color="${C.flood}" stop-opacity="0.16"/><stop offset="1" stop-color="${C.flood}" stop-opacity="0"/>
    </radialGradient>
    <filter id="${id}-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${w / 260}"/></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#${id}-sky)"/>`;
  // Stands: two tiers with a speckled crowd.
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (const [top, color] of [
    [horizon - h * 0.2, "#0a1220"],
    [horizon - h * 0.1, "#0c1626"],
  ])
    s += `<path d="M0 ${horizon} L0 ${top + h * 0.03} Q${w / 2} ${top - h * 0.04} ${w} ${top + h * 0.03} L${w} ${horizon} Z" fill="${color}"/>`;
  for (let i = 0; i < w * 0.9; i++) {
    const x = rnd() * w;
    const y = horizon - h * 0.19 + rnd() * h * 0.19;
    s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(w / 900).toFixed(2)}" height="${(w / 900).toFixed(2)}" fill="${C.flood}" opacity="${(0.05 + rnd() * 0.2).toFixed(2)}"/>`;
  }
  // Floodlight towers.
  for (const lx of lights.map((f) => w * f)) {
    const ly = h * 0.1;
    const bw = w * 0.05;
    s += `<circle cx="${lx}" cy="${ly}" r="${w * 0.22}" fill="url(#${id}-flood)"/>`;
    s += `<rect x="${lx - 1}" y="${ly}" width="2" height="${horizon - ly - h * 0.12}" fill="#0a1322"/>`;
    s += `<rect x="${lx - bw / 2 - 3}" y="${ly - bw * 0.2 - 3}" width="${bw + 6}" height="${bw * 0.4 + 6}" fill="#121d30"/>`;
    for (let r = 0; r < 2; r++)
      for (let k = 0; k < 6; k++)
        s += `<rect x="${(lx - bw / 2 + (k + 0.15) * (bw / 6)).toFixed(1)}" y="${(ly - bw * 0.2 + (r + 0.15) * (bw * 0.2)).toFixed(1)}" width="${(bw / 6) * 0.7}" height="${bw * 0.14}" fill="#fffbe8"/>`;
  }
  // The field: stripes and yard lines converging on (vx, horizon).
  const fieldTop = horizon;
  const halfNear = w * 1.1;
  const xAt = (t, y) => vx + t * halfNear * ((y - fieldTop) / (h - fieldTop));
  s += `<polygon points="${xAt(-1, h)},${h} ${xAt(1, h)},${h} ${vx},${fieldTop}" fill="${C.turf}"/>`;
  s += `<rect x="0" y="${fieldTop}" width="${w}" height="${h - fieldTop}" fill="${C.turf}"/>`;
  // Mowing bands get closer together toward the horizon.
  for (let i = 0; i < 14; i++) {
    const y0 = fieldTop + (h - fieldTop) * Math.pow(i / 14, 1.9);
    const y1 = fieldTop + (h - fieldTop) * Math.pow((i + 1) / 14, 1.9);
    if (i % 2) s += `<rect x="0" y="${y0.toFixed(1)}" width="${w}" height="${(y1 - y0).toFixed(1)}" fill="${C.turf2}"/>`;
    s += `<rect x="0" y="${y1.toFixed(1)}" width="${w}" height="${Math.max(1, (y1 - fieldTop) / (h - fieldTop) * (h / 220)).toFixed(1)}" fill="${C.chalk}" opacity="0.55"/>`;
  }
  for (const t of [-0.55, -0.12, 0.12, 0.55]) s += `<line x1="${xAt(t, h)}" y1="${h}" x2="${vx}" y2="${fieldTop}" stroke="${C.chalk}" stroke-width="${w / 700}" opacity="0.4"/>`;
  s += `<rect x="0" y="${fieldTop}" width="${w}" height="${h - fieldTop}" fill="url(#${id}-pool)"/>`;
  s += `<rect x="0" y="${fieldTop}" width="${w}" height="${h - fieldTop}" fill="url(#${id}-fade)"/>`;
  if (posts) {
    const { x, size } = posts;
    const half = size * 0.5;
    const bar = horizon - size * 0.3;
    const top = horizon - size * 1.6;
    const path = `M${x} ${horizon} V${bar} M${x - half} ${bar} H${x + half} M${x - half} ${bar} V${top} M${x + half} ${bar} V${top}`;
    s += `<path d="${path}" fill="none" stroke="${C.post}" stroke-width="${size * 0.07}" stroke-linecap="round" filter="url(#${id}-glow)" opacity="0.9"/>`;
    s += `<path d="${path}" fill="none" stroke="${C.post}" stroke-width="${size * 0.045}" stroke-linecap="round"/>`;
  }
  return s;
}

// A heavy condensed headline with a soft floodlight halo.
const headline = (id, x, y, size, text, fill, anchor = "start") => `
  <defs><filter id="${id}" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="${size / 14}"/></filter></defs>
  <text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Anton" font-size="${size}" fill="${fill}" opacity="0.45" filter="url(#${id})">${text}</text>
  <text x="${x}" y="${y + size * 0.05}" text-anchor="${anchor}" font-family="Anton" font-size="${size}" fill="#000" opacity="0.5">${text}</text>
  <text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Anton" font-size="${size}" fill="${fill}">${text}</text>`;

const pill = (x, y, w, h, size, text) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.18}" fill="${C.amber}"/>
  <text x="${x + w / 2}" y="${y + h / 2 + size * 0.36}" text-anchor="middle" font-family="Barlow Condensed" font-weight="700" font-size="${size}" letter-spacing="${size * 0.12}" fill="${C.ink}">${text}</text>`;

const label = (x, y, size, text, fill = C.chalk, anchor = "start", opacity = 1) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Barlow Condensed" font-weight="700" font-size="${size}" letter-spacing="${size * 0.22}" fill="${fill}" opacity="${opacity}">${text}</text>`;

function pfp() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  ${stadium("p", 1024, 1024, { horizon: 560 })}
  <circle cx="512" cy="512" r="430" fill="${C.ink}" opacity="0.35"/>
  ${placeBadge("pb", 512, 512, 400)}
</svg>`;
}

// X banner, designed at 1500x500 and exported at 1500, 1200 and 600 wide. The profile photo sits
// over the bottom-left corner, so the words start a third of the way in.
function banner() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 500" width="1500" height="500">
  ${stadium("b", 1500, 500, { horizon: 300, vx: 1330 })}
  <rect width="1500" height="500" fill="${C.ink}" opacity="0.18"/>
  ${label(444, 128, 25, "SUPER BOWL LXI · FEB 14, 2027 · ON-CHAIN", C.amber)}
  ${headline("bh1", 440, 250, 116, "SUPER BOWL", C.chalk)}
  ${headline("bh2", 990, 250, 116, "2027", C.amber)}
  ${pill(444, 290, 420, 58, 28, "$SUPERBOWL · ON PUMP.FUN")}
  ${label(446, 398, 24, "16 TEAM COINS · EVERY TRADE BURNS $SUPERBOWL", C.chalk, "start", 0.85)}
  ${placeBadge("bb", 1330, 240, 124)}
</svg>`;
}

// Share card for X / Telegram, 1200x630.
function og() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  ${stadium("o", 1200, 630, { horizon: 380, vx: 900, posts: { x: 900, size: 120 } })}
  <rect width="1200" height="630" fill="${C.ink}" opacity="0.2"/>
  ${label(70, 118, 26, "SUPER BOWL LXI · SOFI STADIUM · FEB 14, 2027", C.amber)}
  ${headline("oh1", 64, 262, 150, "SUPER BOWL", C.chalk)}
  ${headline("oh2", 64, 405, 150, "2027", C.amber)}
  ${pill(70, 450, 450, 64, 31, "$SUPERBOWL · ON PUMP.FUN")}
  ${label(72, 566, 25, "16 TEAMS · AFC VS NFC · EVERY TRADE BURNS", C.chalk, "start", 0.85)}
  ${placeBadge("ob", 960, 250, 170)}
</svg>`;
}

// The badge alone on transparent, for the site and anywhere else.
const badgeOnly = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">${badge("x")}</svg>`;

// Simplified mark for tiny favicons (16-48px), where the ring lettering would be noise.
function mark() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="96" fill="${C.amber}" stroke="${C.ink}" stroke-width="8"/>
  <circle cx="100" cy="100" r="76" fill="${C.turf2}" stroke="${C.ink}" stroke-width="8"/>
  <g transform="rotate(-32 100 100)">
    <ellipse cx="100" cy="100" rx="52" ry="31" fill="#8a3b12" stroke="${C.ink}" stroke-width="7"/>
    <path d="M70 100h60" stroke="${C.chalk}" stroke-width="8" stroke-linecap="round"/>
    <path d="M86 90v20M100 90v20M114 90v20" stroke="${C.chalk}" stroke-width="7" stroke-linecap="round"/>
  </g>
</svg>`;
}

function render(svg, file, width) {
  const r = new Resvg(svg, {
    font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Barlow Condensed" },
    fitTo: { mode: "width", value: width },
  });
  const png = r.render().asPng();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, png);
  return png;
}

async function main() {
  const out = [];
  const put = (svg, file, width) => {
    render(svg, file, width);
    out.push(path.relative(ROOT, file));
  };
  for (const w of [1024, 400]) put(pfp(), path.join(BRAND, `superbowl-pfp-${w}.png`), w);
  for (const [w, h] of [
    [1500, 500],
    [1200, 400],
    [600, 200],
  ])
    put(banner(), path.join(BRAND, `superbowl-banner-${w}x${h}.png`), w);
  put(badgeOnly(), path.join(BRAND, "badge.png"), 512);
  put(og(), path.join(ROOT, "public", "og.png"), 1200);
  // Site icons: browser tab, phone home screen, and a multi-size favicon.ico.
  put(pfp(), path.join(ROOT, "src", "app", "icon.png"), 512);
  put(pfp(), path.join(ROOT, "src", "app", "apple-icon.png"), 180);
  const small = [16, 32, 48].map((w) => new Resvg(mark(), { fitTo: { mode: "width", value: w } }).render().asPng());
  const toIco = require("png-to-ico");
  fs.writeFileSync(path.join(ROOT, "src", "app", "favicon.ico"), await toIco(small));
  out.push("src/app/favicon.ico");
  console.log(out.join("\n"));
}

if (require.main === module)
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });

module.exports = { C, badge, placeBadge, stadium, headline, pill, label, render };
