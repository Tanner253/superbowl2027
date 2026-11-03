// Kick Return renderer: a broadcast camera behind and above the returner, looking downfield at a
// night stadium. The field, end zones, numbers and posts are projected in perspective; players are
// HD sprites (sprites.ts) sorted by depth, with floodlight shadows; the HUD is an LED scorebug.
import { FIELD_W, HASH_X, runYards, spot, type World } from "./engine";
import { FEET, FRAMES, SPR_H, SPR_W, VISITORS, frames, type Kit } from "./sprites";

const CAM_H = 14;
const BACK = 13;
const NEAR = 1.4;
const BODY_H = 2.05;

type Pop = { text: string; t: number; max: number; color: string; big: boolean };
type Bit = { x: number; y: number; vx: number; vy: number; r: number; vr: number; c: string; life: number };

export type Renderer = {
  resize(W: number, H: number, dpr: number): void;
  frame(ctx: CanvasRenderingContext2D, w: World, dt: number, kit: Kit, font: string, effects: boolean, showHud?: boolean): void;
};

export function createRenderer(): Renderer {
  let W = 1;
  let H = 1;
  let dpr = 1;
  let horizon = 0;
  let F = 1;
  let backdrop: HTMLCanvasElement | null = null;
  let vignette: HTMLCanvasElement | null = null;
  const cam = { x: FIELD_W / 2, y: -BACK };
  let shake = 0;
  let clock = 0;
  const pops: Pop[] = [];
  let confetti: Bit[] = [];

  const proj = (x: number, y: number, h = 0) => {
    const dz = Math.max(0.05, y - cam.y);
    const k = F / dz;
    return { x: W / 2 + (x - cam.x) * k, y: horizon + (CAM_H - h) * k, k, dz };
  };

  function quad(ctx: CanvasRenderingContext2D, x0: number, x1: number, y0: number, y1: number, color: string) {
    const a = proj(x0, y0);
    const b = proj(x1, y0);
    const c = proj(x1, y1);
    const d = proj(x0, y1);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(d.x, d.y);
    ctx.closePath();
    ctx.fill();
  }

  // Text painted flat on the turf: r is the reading direction and d the glyphs' "down", in field axes.
  function groundText(ctx: CanvasRenderingContext2D, font: string, text: string, x0: number, y0: number, r: [number, number], d: [number, number], size: number, color: string) {
    if (y0 - cam.y < NEAR + 1) return;
    const O = proj(x0, y0);
    const U = proj(x0 + 1, y0);
    const V = proj(x0, y0 + 1);
    const ux = U.x - O.x;
    const uy = U.y - O.y;
    const vx = V.x - O.x;
    const vy = V.y - O.y;
    ctx.save();
    ctx.transform((r[0] * ux + r[1] * vx) / 10, (r[0] * uy + r[1] * vy) / 10, (d[0] * ux + d[1] * vx) / 10, (d[0] * uy + d[1] * vy) / 10, O.x, O.y);
    ctx.font = `${size * 10}px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  function paintBackdrop(font: string) {
    const bw = Math.round(W * 1.6);
    const bh = Math.round(horizon + 6);
    const c = document.createElement("canvas");
    c.width = Math.round(bw * dpr);
    c.height = Math.round(bh * dpr);
    const g = c.getContext("2d")!;
    g.scale(dpr, dpr);
    const sky = g.createLinearGradient(0, 0, 0, bh);
    sky.addColorStop(0, "#02050b");
    sky.addColorStop(1, "#0e1d33");
    g.fillStyle = sky;
    g.fillRect(0, 0, bw, bh);
    // Two tiers of stands, speckled with the crowd.
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (const [top, color] of [
      [bh * 0.38, "#0a1220"],
      [bh * 0.62, "#0c1626"],
    ] as const) {
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(0, bh);
      g.lineTo(0, top + 10);
      g.quadraticCurveTo(bw / 2, top - 14, bw, top + 10);
      g.lineTo(bw, bh);
      g.closePath();
      g.fill();
    }
    for (let i = 0; i < bw * 1.4; i++) {
      const x = rnd() * bw;
      const y = bh * 0.36 + rnd() * bh * 0.6;
      g.fillStyle = `rgba(${200 + rnd() * 55},${190 + rnd() * 50},${180 + rnd() * 60},${0.06 + rnd() * 0.2})`;
      g.fillRect(x, y, 1.3, 1.3);
    }
    // LED ribbon board along the fascia.
    const ry = bh * 0.6;
    g.fillStyle = "#050a12";
    g.fillRect(0, ry, bw, 9);
    g.font = `8px ${font}`;
    g.textBaseline = "middle";
    for (let x = 6, i = 0; x < bw; x += 120, i++) {
      g.fillStyle = i % 2 ? "#ffc23d" : "#f4f7f2";
      g.fillText(i % 2 ? "$SUPERBOWL" : "KICK RETURN", x, ry + 4.8);
    }
    // Light towers with their bloom.
    for (const lx of [bw * 0.08, bw * 0.32, bw * 0.68, bw * 0.92]) {
      const ly = bh * 0.14;
      const bloom = g.createRadialGradient(lx, ly, 0, lx, ly, bw * 0.2);
      bloom.addColorStop(0, "rgba(255,243,207,0.32)");
      bloom.addColorStop(0.3, "rgba(255,243,207,0.07)");
      bloom.addColorStop(1, "rgba(255,243,207,0)");
      g.fillStyle = bloom;
      g.fillRect(0, 0, bw, bh);
      g.fillStyle = "#121c2c";
      g.fillRect(lx - 17, ly - 6, 34, 12);
      for (let r = 0; r < 2; r++)
        for (let k = 0; k < 6; k++) {
          g.fillStyle = "#fffbe8";
          g.fillRect(lx - 15 + k * 5.4, ly - 4 + r * 5, 3.6, 3);
        }
    }
    backdrop = c;

    const v = document.createElement("canvas");
    v.width = Math.round(W * dpr);
    v.height = Math.round(H * dpr);
    const vg = v.getContext("2d")!;
    vg.scale(dpr, dpr);
    const grad = vg.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.35, W / 2, H * 0.55, Math.max(W, H) * 0.85);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.55)");
    vg.fillStyle = grad;
    vg.fillRect(0, 0, W, H);
    vignette = v;
  }

  function field(ctx: CanvasRenderingContext2D, kit: Kit, font: string) {
    const y0 = cam.y + NEAR;
    // Ground beyond the field: the sideline apron.
    ctx.fillStyle = "#0a3119";
    ctx.fillRect(0, horizon, W, H - horizon);
    // Mowed in five-yard stripes, end zones in colour.
    for (let y = Math.floor(y0 / 5) * 5; y < 110; y += 5) {
      const a = Math.max(y, y0);
      const b = y + 5;
      if (b <= a || b <= -10) continue;
      const color = y < 0 ? kit.jersey : y >= 100 ? "#d39a1c" : Math.floor(y / 5) % 2 ? "#0f5a2b" : "#12672f";
      quad(ctx, 0, FIELD_W, Math.max(a, -10), b, color);
    }
    // End zone paint: the ticker in theirs, the game's name in ours.
    groundText(ctx, font, "$SUPERBOWL", FIELD_W / 2, 105, [1, 0], [0, -1], 6, "rgba(4,8,15,0.8)");
    groundText(ctx, font, "KICK RETURN", FIELD_W / 2, -5, [1, 0], [0, -1], 5, "rgba(244,247,242,0.85)");

    // Chalk: sidelines, yard lines, hash marks, numbers.
    quad(ctx, -0.6, 0, Math.max(y0, -10), 110, "#f1f4ee");
    quad(ctx, FIELD_W, FIELD_W + 0.6, Math.max(y0, -10), 110, "#f1f4ee");
    ctx.strokeStyle = "rgba(241,244,238,0.92)";
    for (let y = Math.ceil(y0 / 5) * 5; y <= 110; y += 5) {
      if (y < -10 || (y > 100 && y < 110)) continue;
      const a = proj(0, y);
      const b = proj(FIELD_W, y);
      ctx.lineWidth = Math.max(0.8, (y === 0 || y === 100 ? 0.28 : 0.13) * a.k);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    for (let y = Math.ceil(Math.max(y0, 1)); y < 100; y++) {
      if (y % 5 === 0) continue;
      const k = proj(0, y).k;
      if (k < 2.5) break;
      ctx.lineWidth = Math.max(0.7, 0.11 * k);
      for (const hx of [...HASH_X, 0.9, FIELD_W - 0.9]) {
        const a = proj(hx - 0.35, y);
        const b = proj(hx + 0.35, y);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    for (let y = 10; y < 100; y += 10) {
      if (y - cam.y > 75) continue;
      const n = String(y <= 50 ? y : 100 - y);
      groundText(ctx, font, n, 9, y, [0, -1], [-1, 0], 2, "rgba(241,244,238,0.85)");
      groundText(ctx, font, n, FIELD_W - 9, y, [0, 1], [1, 0], 2, "rgba(241,244,238,0.85)");
    }
  }

  function posts(ctx: CanvasRenderingContext2D, glow: number) {
    const pt = (x: number, h: number) => proj(x, 110.5, h);
    const base = pt(FIELD_W / 2, 0);
    const neck = pt(FIELD_W / 2, 3.33);
    const l = pt(HASH_X[0] + 0.4, 3.33);
    const r = pt(HASH_X[1] - 0.4, 3.33);
    const lt = pt(HASH_X[0] + 0.4, 13);
    const rt = pt(HASH_X[1] - 0.4, 13);
    ctx.save();
    ctx.strokeStyle = "#ffd447";
    ctx.lineCap = "round";
    ctx.shadowColor = `rgba(255,212,71,${0.4 + glow * 0.6})`;
    ctx.shadowBlur = 6 + glow * 24;
    ctx.lineWidth = Math.max(1.2, 0.25 * base.k);
    ctx.beginPath();
    ctx.moveTo(base.x, base.y);
    ctx.lineTo(neck.x, neck.y);
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(r.x, r.y);
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(lt.x, lt.y);
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(rt.x, rt.y);
    ctx.stroke();
    ctx.restore();
  }

  function shadow(ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number) {
    const g = proj(x, y);
    if (g.dz < NEAR) return;
    const squash = Math.min(1, CAM_H / g.dz) * 0.55;
    ctx.fillStyle = `rgba(0,0,0,${0.45 * alpha})`;
    ctx.beginPath();
    ctx.ellipse(g.x, g.y, 0.6 * g.k, 0.6 * g.k * squash, 0, 0, Math.PI * 2);
    ctx.fill();
    // Fainter crossed shadows from the light towers.
    ctx.fillStyle = `rgba(0,0,0,${0.14 * alpha})`;
    for (const side of [-1, 1]) {
      const s = proj(x + side * 0.85, y + 0.6);
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, 0.85 * s.k, 0.3 * s.k * squash * 2, side * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function sprite(ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, x: number, y: number, opts: { alpha?: number; lie?: number; flip?: boolean } = {}) {
    const g = proj(x, y);
    if (g.dz < NEAR) return;
    const h = BODY_H * g.k * (SPR_H / (FEET - 4));
    const w = h * (SPR_W / SPR_H);
    ctx.save();
    ctx.globalAlpha = opts.alpha ?? 1;
    ctx.translate(g.x, g.y);
    if (opts.lie) ctx.rotate(opts.lie);
    if (opts.flip) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h * (FEET / SPR_H), w, h);
    ctx.restore();
  }

  function burst() {
    const colors = ["#ffc23d", "#f4f7f2", "#7cf07a", "#ff5a67", "#79a2ff"];
    confetti = Array.from({ length: 90 }, (_, i) => ({
      x: W / 2 + (Math.random() - 0.5) * 60,
      y: H * 0.36,
      vx: (Math.random() - 0.5) * 520,
      vy: -180 - Math.random() * 360,
      r: Math.random() * 6,
      vr: (Math.random() - 0.5) * 16,
      c: colors[i % colors.length],
      life: 0,
    }));
  }

  function hud(ctx: CanvasRenderingContext2D, w: World, font: string) {
    // Scorebug, top left: yards in LED numerals and where the ball is.
    ctx.save();
    ctx.fillStyle = "rgba(4,8,15,0.82)";
    ctx.strokeStyle = "rgba(255,194,61,0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(10, 10, 118, 52, 8);
    ctx.fill();
    ctx.stroke();
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(244,247,242,0.6)";
    ctx.font = `10px ${font}`;
    ctx.fillText("YARDS", 20, 26);
    ctx.textAlign = "right";
    ctx.fillText(w.mode === "play" ? spot(w.p.y) : w.mode === "td" ? "TOUCHDOWN" : "", 118, 26);
    ctx.textAlign = "left";
    ctx.shadowColor = "rgba(255,194,61,0.7)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#ffc23d";
    ctx.font = `28px ${font}`;
    ctx.fillText(String(runYards(w)), 20, 54);
    ctx.shadowBlur = 0;
    // Top right: kickoff, touchdowns, turbo.
    const x = W - 128;
    ctx.fillStyle = "rgba(4,8,15,0.82)";
    ctx.beginPath();
    ctx.roundRect(x, 10, 118, 52, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(244,247,242,0.18)";
    ctx.stroke();
    ctx.fillStyle = "#f4f7f2";
    ctx.font = `13px ${font}`;
    ctx.fillText(`KICKOFF ${w.level + 1}`, x + 10, 28);
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffc23d";
    ctx.fillText(`TD ${w.tds}`, x + 108, 28);
    ctx.textAlign = "left";
    const segs = 10;
    const on = Math.ceil((w.p.stamina / 100) * segs);
    for (let i = 0; i < segs; i++) {
      ctx.fillStyle = i < on ? (w.p.stamina > 25 ? (w.p.turbo ? "#c9ff9a" : "#7cf07a") : "#ff4d5a") : "rgba(244,247,242,0.14)";
      ctx.fillRect(x + 10 + i * 10, 38, 8, 9);
    }
    ctx.fillStyle = "rgba(244,247,242,0.55)";
    ctx.font = `9px ${font}`;
    ctx.fillText("TURBO", x + 10, 57);
    ctx.restore();
  }

  return {
    resize(nw, nh, ratio) {
      W = Math.max(1, nw);
      H = Math.max(1, nh);
      dpr = ratio;
      horizon = H * 0.19;
      F = ((H * 0.8 - horizon) * BACK) / CAM_H;
      backdrop = null;
    },
    frame(ctx, w, dt, kit, font, effects, showHud = true) {
      if (!backdrop) paintBackdrop(font);
      clock += dt;
      const pop = (text: string, color: string, big: boolean, max: number) => pops.push({ text, color, big, t: 0, max });
      for (const e of w.events.splice(0)) {
        if (e === "go") pop("GO!", "#7cf07a", true, 0.8);
        if (e === "juke") pop("JUKE!", "#ffc23d", false, 0.7);
        if (e === "td") {
          pop("TOUCHDOWN!", "#ffc23d", true, 2);
          if (effects) burst();
        }
        if (e === "tackle") {
          pop("TACKLED", "#ff5a67", true, 1.4);
          if (effects) shake = 0.45;
        }
        if (e === "oob") pop("OUT OF BOUNDS", "#f4f7f2", true, 1.4);
      }

      // Camera: behind the returner, easing across so the field doesn't lurch.
      const p = w.p;
      const tx = Math.max(7.5, Math.min(FIELD_W - 7.5, p.x));
      cam.x += (tx - cam.x) * Math.min(1, dt * 5);
      cam.y = p.y - BACK;
      shake = Math.max(0, shake - dt);
      const sx = shake ? (Math.random() - 0.5) * shake * 18 : 0;
      const sy = shake ? (Math.random() - 0.5) * shake * 18 : 0;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(sx, sy);
      // Stadium, with a little parallax as the camera slides.
      ctx.drawImage(backdrop!, -(W * 0.3) - (cam.x - FIELD_W / 2) * 2.2, 0, W * 1.6, horizon + 6);
      if (effects)
        for (let i = 0; i < 3; i++)
          if (Math.random() < 0.25) {
            // Camera flashes in the stands.
            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.fillRect(Math.random() * W, horizon * (0.45 + Math.random() * 0.45), 1.6, 1.6);
          }
      field(ctx, kit, font);
      // Haze toward the far end.
      const haze = ctx.createLinearGradient(0, horizon, 0, horizon + H * 0.12);
      haze.addColorStop(0, "rgba(8,17,31,0.95)");
      haze.addColorStop(1, "rgba(8,17,31,0)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, horizon, W, H * 0.12);
      posts(ctx, w.mode === "td" ? Math.max(0, 1 - w.t / 2) : 0);

      // Dust and turf kicked up.
      for (const q of w.particles) {
        const g = proj(q.x, q.y, 0.25);
        if (g.dz < NEAR) continue;
        ctx.globalAlpha = Math.max(0, 1 - q.life / q.max);
        ctx.fillStyle = q.color;
        ctx.beginPath();
        ctx.arc(g.x, g.y, q.size * g.k, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Everyone on the field, far to near.
      const fr = (phase: number) => Math.floor(((((phase / (Math.PI * 2)) % 1) + 1) % 1) * FRAMES) % FRAMES;
      const list: { y: number; fn: () => void }[] = [];
      for (const b of w.blockers) {
        const set = frames(kit, "away", false, b.num, font);
        list.push({
          y: b.y,
          fn: () => {
            shadow(ctx, b.x, b.y, b.down ? 0.6 : 1);
            sprite(ctx, set[b.down ? 0 : fr(b.phase)], b.x, b.y, b.down ? { lie: -1.45, alpha: 0.9 } : {});
          },
        });
      }
      for (const d of w.defenders) {
        const set = frames(VISITORS, d.y > p.y - 0.5 ? "toward" : "away", false, d.num, font);
        list.push({
          y: d.y,
          fn: () => {
            shadow(ctx, d.x, d.y, 1);
            sprite(ctx, set[d.held ? 2 : fr(d.phase)], d.x, d.y, { alpha: d.stun > 0 ? 0.75 : 1 });
            if (d.stun > 0) {
              const g = proj(d.x, d.y, BODY_H + 0.5);
              ctx.fillStyle = "#ffc23d";
              ctx.font = `${Math.max(9, 0.8 * g.k)}px ${font}`;
              ctx.textAlign = "center";
              const a = clock * 8;
              for (let i = 0; i < 3; i++) ctx.fillText("✦", g.x + Math.cos(a + i * 2.1) * 0.6 * g.k, g.y + Math.sin(a + i * 2.1) * 0.18 * g.k);
            }
          },
        });
      }
      const runner = frames(kit, "away", w.mode !== "catch", 22, font);
      const down = w.mode === "over" && /Tackled/.test(w.endReason);
      list.push({
        y: p.y,
        fn: () => {
          shadow(ctx, p.x, p.y, 1);
          if (p.inv > 0) {
            const g = proj(p.x, p.y);
            ctx.strokeStyle = `rgba(255,194,61,${Math.min(1, p.inv * 1.8)})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(g.x, g.y, 1.3 * g.k * (1.4 - p.inv), 0.45 * g.k * (1.4 - p.inv), 0, 0, Math.PI * 2);
            ctx.stroke();
          }
          sprite(ctx, runner[w.mode === "play" ? fr(p.phase) : 0], p.x, p.y, down ? { lie: 1.35 } : { flip: p.jukeT > 0 && p.jukeDir < 0 });
        },
      });
      list.sort((a, b) => b.y - a.y).forEach((d) => d.fn());

      // The kick dropping into the returner's hands.
      if (w.mode === "catch") {
        const k = Math.min(1, w.t / 1.05);
        const g = proj(p.x + 0.4, p.y + 0.6, 1.4 + (1 - k) * 26);
        const s = proj(p.x + 0.4, p.y + 0.6);
        ctx.fillStyle = `rgba(0,0,0,${0.15 + k * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, 0.3 * s.k, 0.12 * s.k, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(clock * 9);
        ctx.fillStyle = "#7a3210";
        ctx.beginPath();
        ctx.ellipse(0, 0, 0.36 * g.k, 0.22 * g.k, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#f4f7f2";
        ctx.lineWidth = Math.max(1, 0.04 * g.k);
        ctx.beginPath();
        ctx.moveTo(-0.12 * g.k, 0);
        ctx.lineTo(0.12 * g.k, 0);
        ctx.stroke();
        ctx.restore();
      }

      // Turbo: speed streaks at the edges.
      if (effects && w.mode === "play" && p.turbo) {
        ctx.strokeStyle = "rgba(244,247,242,0.16)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
          const side = i % 2 ? 1 : -1;
          const x = W / 2 + side * (W * 0.32 + ((i * 37 + clock * 600) % (W * 0.2)));
          const y = horizon + ((i * 97 + clock * 900) % (H - horizon));
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + side * 6, y + 40);
          ctx.stroke();
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (vignette) ctx.drawImage(vignette, 0, 0, W, H);

      // Confetti on a touchdown.
      confetti = confetti.filter((b) => (b.life += dt) < 2.4);
      for (const b of confetti) {
        b.vy += 520 * dt;
        b.vx *= 0.99;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.r += b.vr * dt;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.r);
        ctx.globalAlpha = Math.max(0, 1 - b.life / 2.4);
        ctx.fillStyle = b.c;
        ctx.fillRect(-4, -2.5, 8, 5);
        ctx.restore();
      }

      // Pops: "GO!", "JUKE!", the touchdown banner.
      for (let i = pops.length - 1; i >= 0; i--) {
        const q = pops[i];
        q.t += dt;
        if (q.t > q.max) {
          pops.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.min(1, (q.max - q.t) * 4, q.t * 8);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (q.big) {
          const s = 1 + Math.max(0, 0.25 - q.t) * 1.6;
          ctx.translate(W / 2, H * 0.34);
          ctx.scale(s, s);
          const size = Math.min(W * 0.13, 54);
          ctx.font = `${size}px ${font}`;
          const tw = ctx.measureText(q.text).width;
          ctx.fillStyle = "rgba(4,8,15,0.75)";
          ctx.beginPath();
          ctx.roundRect(-tw / 2 - 18, -size * 0.72, tw + 36, size * 1.44, 10);
          ctx.fill();
          ctx.shadowColor = q.color;
          ctx.shadowBlur = 18;
          ctx.fillStyle = q.color;
          ctx.fillText(q.text, 0, 2);
        } else {
          const g = proj(p.x, p.y, BODY_H + 0.9);
          ctx.font = `${Math.max(16, 0.9 * g.k)}px ${font}`;
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.shadowBlur = 6;
          ctx.fillStyle = q.color;
          ctx.fillText(q.text, g.x, g.y - q.t * 40);
        }
        ctx.restore();
      }

      if (showHud) hud(ctx, w, font);
    },
  };
}
