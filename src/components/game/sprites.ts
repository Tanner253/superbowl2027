// Kick Return players, drawn by hand on a canvas: helmet, pads, numbers, sleeves, cleats, an
// eight-frame run cycle, lit from above like a night game. Seen from behind (the returner and his
// blockers) or from the front (the coverage coming at you). Pre-rendered once per kit at 2x.

export type Kit = { jersey: string; trim: string; helmet: string; pants: string; num: string };
export type Facing = "away" | "toward";

export const VISITORS: Kit = { jersey: "#eef1ec", trim: "#1d2633", helmet: "#d9dee2", pants: "#c9d0d5", num: "#1d2633" };

export const SPR_W = 120;
export const SPR_H = 180;
// Where the cleats touch the ground, in sprite pixels from the top.
export const FEET = 172;
export const FRAMES = 8;
const RES = 2;

const cache = new Map<string, HTMLCanvasElement[]>();

function mix(hex: string, to: string, t: number) {
  const a = parseInt(hex.slice(1), 16);
  const b = parseInt(to.slice(1), 16);
  const ch = (v: number, s: number) => (v >> s) & 255;
  const c = (s: number) => Math.round(ch(a, s) + (ch(b, s) - ch(a, s)) * t);
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

function line(g: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
}

function ball(g: CanvasRenderingContext2D, x: number, y: number, rot: number) {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.fillStyle = "#7a3210";
  g.strokeStyle = "rgba(0,0,0,0.55)";
  g.lineWidth = 1.5;
  g.beginPath();
  g.ellipse(0, 0, 11, 7, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  g.fillStyle = "rgba(255,190,140,0.35)";
  g.beginPath();
  g.ellipse(-2, -2.5, 6, 2.5, 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#f4f7f2";
  g.lineWidth = 1.6;
  line(g, -4, -1, 4, -1);
  for (const x2 of [-2.5, 0, 2.5]) line(g, x2, -2.6, x2, 0.6);
  g.restore();
}

// One frame of one player. f = 0 … 1 through the stride.
function figure(g: CanvasRenderingContext2D, kit: Kit, facing: Facing, f: number, carrying: boolean, num: number, font: string) {
  const p = f * Math.PI * 2;
  const s = Math.sin(p);
  const bob = Math.abs(Math.cos(p)) * 3;
  const sock = mix(kit.jersey, "#000000", 0.15);
  const dark = "#10141b";
  g.lineCap = "round";
  g.lineJoin = "round";

  // Legs: the lifted leg kicks its heel up; the planted one stays on the ground.
  const leg = (hipX: number, lift: number, side: number) => {
    const kneeX = hipX + side * 3;
    const kneeY = 136 - lift * 14 - bob;
    const footX = hipX + side * 5;
    const footY = FEET - 2 - lift * 34;
    g.strokeStyle = kit.pants;
    g.lineWidth = 20;
    line(g, hipX, 100 - bob, kneeX, kneeY);
    g.strokeStyle = sock;
    g.lineWidth = 13;
    line(g, kneeX, kneeY + 4, footX, footY - 6);
    g.strokeStyle = kit.trim;
    g.lineWidth = 13.5;
    line(g, kneeX + (footX - kneeX) * 0.28, kneeY + 4 + (footY - kneeY) * 0.28, kneeX + (footX - kneeX) * 0.4, kneeY + 4 + (footY - kneeY) * 0.4);
    g.fillStyle = dark;
    g.beginPath();
    g.ellipse(footX, footY - 1, 9, lift > 0.3 ? 6.5 : 4.5, 0, 0, Math.PI * 2);
    g.fill();
  };
  const liftL = Math.max(0, s);
  const liftR = Math.max(0, -s);
  if (liftL > liftR) {
    leg(48, liftR, -1);
    leg(72, liftL, 1);
  } else {
    leg(72, liftL, 1);
    leg(48, liftR, -1);
  }

  g.save();
  g.translate(0, -bob);

  // Arms swing against the legs; the returner keeps the ball tucked on his right side.
  const arm = (sx: number, side: number, swing: number) => {
    const ex = sx + side * 9;
    const ey = 80 + swing * 7;
    const hx = sx + side * 6 - swing * side * 3;
    const hy = 96 - swing * 12;
    g.strokeStyle = kit.jersey;
    g.lineWidth = 15;
    line(g, sx, 60, ex, ey);
    g.strokeStyle = dark;
    g.lineWidth = 10;
    line(g, ex, ey, hx, hy);
    g.fillStyle = kit.trim;
    g.beginPath();
    g.arc(hx, hy, 5.5, 0, Math.PI * 2);
    g.fill();
  };
  arm(30, -1, s);
  if (!carrying) arm(90, 1, -s);

  // Pants top and jersey with shoulder pads.
  g.fillStyle = kit.pants;
  g.beginPath();
  g.roundRect(39, 88, 42, 20, 7);
  g.fill();
  g.fillStyle = kit.jersey;
  g.strokeStyle = "rgba(0,0,0,0.45)";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(38, 100);
  g.lineTo(82, 100);
  g.quadraticCurveTo(88, 82, 90, 66);
  g.lineTo(98, 60);
  g.quadraticCurveTo(98, 46, 84, 43);
  g.lineTo(36, 43);
  g.quadraticCurveTo(22, 46, 22, 60);
  g.lineTo(30, 66);
  g.quadraticCurveTo(32, 82, 38, 100);
  g.closePath();
  g.fill();
  g.stroke();
  // Sleeve stripes on the pads.
  g.strokeStyle = kit.trim;
  g.lineWidth = 3.5;
  line(g, 24, 56, 33, 52);
  line(g, 96, 56, 87, 52);
  // Collar.
  g.fillStyle = kit.trim;
  g.beginPath();
  if (facing === "away") g.ellipse(60, 45, 11, 4, 0, 0, Math.PI * 2);
  else {
    g.moveTo(49, 44);
    g.lineTo(60, 54);
    g.lineTo(71, 44);
    g.closePath();
  }
  g.fill();
  // Number: big on the back, smaller on the chest.
  const big = facing === "away";
  g.font = `${big ? 34 : 24}px ${font}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.lineWidth = 3;
  g.strokeStyle = kit.trim;
  g.strokeText(String(num), 60, big ? 75 : 72);
  g.fillStyle = kit.num;
  g.fillText(String(num), 60, big ? 75 : 72);

  if (carrying) {
    // Tucked ball, high and tight, with the forearm wrapped over it.
    ball(g, 92, 74, -0.5);
    g.strokeStyle = kit.jersey;
    g.lineWidth = 15;
    line(g, 90, 60, 97, 78);
    g.strokeStyle = dark;
    g.lineWidth = 10;
    line(g, 97, 78, 86, 80);
  }

  // Helmet: stripe down the middle, facemask from the front.
  g.fillStyle = dark;
  g.fillRect(53, 36, 14, 10);
  g.fillStyle = kit.helmet;
  g.strokeStyle = "rgba(0,0,0,0.5)";
  g.lineWidth = 2;
  g.beginPath();
  g.ellipse(60, 27, 17, 18.5, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  g.save();
  g.beginPath();
  g.ellipse(60, 27, 17, 18.5, 0, 0, Math.PI * 2);
  g.clip();
  g.fillStyle = kit.trim;
  g.fillRect(56.5, 6, 7, 40);
  if (facing === "toward") {
    g.fillStyle = "rgba(4,8,15,0.85)";
    g.beginPath();
    g.ellipse(60, 30, 12, 7, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
  if (facing === "toward") {
    g.strokeStyle = "#9aa3ab";
    g.lineWidth = 2.4;
    line(g, 47, 35, 73, 35);
    line(g, 49, 40, 71, 40);
    line(g, 60, 33, 60, 45);
  }
  // Helmet shine.
  g.fillStyle = "rgba(255,255,255,0.35)";
  g.beginPath();
  g.ellipse(53, 18, 5, 3, -0.5, 0, Math.PI * 2);
  g.fill();
  g.restore();

  // Floodlit from above: brighter at the shoulders, falling off to the cleats.
  g.globalCompositeOperation = "source-atop";
  const light = g.createLinearGradient(0, 0, 0, SPR_H);
  light.addColorStop(0, "rgba(255,248,225,0.22)");
  light.addColorStop(0.45, "rgba(255,248,225,0)");
  light.addColorStop(1, "rgba(0,0,0,0.38)");
  g.fillStyle = light;
  g.fillRect(0, 0, SPR_W, SPR_H);
  g.globalCompositeOperation = "source-over";
}

// The eight run frames for a kit, facing and number, drawn once and reused.
export function frames(kit: Kit, facing: Facing, carrying: boolean, num: number, font: string) {
  const key = `${kit.jersey}|${kit.trim}|${facing}|${carrying}|${num}|${font}`;
  let set = cache.get(key);
  if (!set) {
    set = Array.from({ length: FRAMES }, (_, i) => {
      const c = document.createElement("canvas");
      c.width = SPR_W * RES;
      c.height = SPR_H * RES;
      const g = c.getContext("2d")!;
      g.scale(RES, RES);
      figure(g, kit, facing, i / FRAMES, carrying, num, font);
      return c;
    });
    cache.set(key, set);
  }
  return set;
}

export const kitFor = (t: { color: string; stripe: string; on: string }): Kit => ({
  jersey: t.color,
  trim: t.stripe,
  helmet: t.color,
  pants: mixHex(t.stripe, "#f4f7f2", 0.35),
  num: t.on,
});

function mixHex(hex: string, to: string, t: number) {
  const m = mix(hex, to, t).match(/\d+/g)!.map(Number);
  return `#${m.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
