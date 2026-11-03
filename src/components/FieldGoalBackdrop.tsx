"use client";

import { useEffect, useRef } from "react";

// The home hero's background: a night stadium seen from behind the holder, a field goal sailing
// end over end through the uprights, the posts lighting up when it's good. Drawn on a canvas at
// the screen's pixel density (capped at 2x). The stadium, field and lights are painted once per
// resize; each frame only adds the ball, its trail and the glow. Paused off-screen and in hidden
// tabs; with reduced motion it paints one still frame and never animates.

const LOOP_MS = 7000;
const SNAP_MS = 700;
const FLIGHT_MS = 2300;

// World units are yards. The camera sits behind the spot, looking down the field at the posts.
const CAM_H = 3.2;
const Z_NEAR = 3.4;
const Z_SPOT = 9;
const Z_GOAL = 52;
const BAR_H = 3.33;
const POST_HALF = 3.08;
const UPRIGHT_H = 11;

type View = { w: number; h: number; cx: number; hy: number; f: number };

const project = (v: View, x: number, y: number, z: number) => ({ x: v.cx + (x * v.f) / z, y: v.hy + ((CAM_H - y) * v.f) / z, s: v.f / z });

function paintStadium(ctx: CanvasRenderingContext2D, v: View) {
  const { w, h, hy } = v;
  const sky = ctx.createLinearGradient(0, 0, 0, hy);
  sky.addColorStop(0, "#03060c");
  sky.addColorStop(1, "#0d1c33");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // The far stands: a dark bowl along the horizon, speckled with the crowd.
  const standTop = hy - h * 0.12;
  ctx.fillStyle = "#070e1a";
  ctx.beginPath();
  ctx.moveTo(0, hy);
  ctx.lineTo(0, standTop + h * 0.05);
  ctx.quadraticCurveTo(w / 2, standTop - h * 0.04, w, standTop + h * 0.05);
  ctx.lineTo(w, hy);
  ctx.closePath();
  ctx.fill();
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < Math.round(w * 1.2); i++) {
    const x = rnd() * w;
    const top = standTop + h * 0.05 - Math.sin((x / w) * Math.PI) * h * 0.09;
    const y = top + rnd() * (hy - top);
    ctx.fillStyle = `rgba(${200 + rnd() * 55},${200 + rnd() * 40},${190 + rnd() * 50},${0.05 + rnd() * 0.16})`;
    ctx.fillRect(x, y, 1.2, 1.2);
  }

  // Floodlight banks on their towers, with the haze they throw.
  for (const side of [-1, 1]) {
    const lx = w / 2 + side * w * 0.43;
    const ly = Math.max(24, h * 0.05);
    const haze = ctx.createRadialGradient(lx, ly, 0, lx, ly, w * 0.42);
    haze.addColorStop(0, "rgba(255,243,207,0.34)");
    haze.addColorStop(0.35, "rgba(255,243,207,0.08)");
    haze.addColorStop(1, "rgba(255,243,207,0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#0a1322";
    ctx.fillRect(lx - 1.5, ly, 3, hy - ly);
    const bw = Math.max(40, w * 0.06);
    const bh = bw * 0.36;
    ctx.fillStyle = "#121d30";
    ctx.fillRect(lx - bw / 2 - 3, ly - bh / 2 - 3, bw + 6, bh + 6);
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 8; c++) {
        const px = lx - bw / 2 + (c + 0.5) * (bw / 8);
        const py = ly - bh / 2 + (r + 0.5) * (bh / 3);
        const g = ctx.createRadialGradient(px, py, 0, px, py, bw / 9);
        g.addColorStop(0, "rgba(255,252,240,1)");
        g.addColorStop(1, "rgba(255,243,207,0)");
        ctx.fillStyle = g;
        ctx.fillRect(px - bw / 8, py - bw / 8, bw / 4, bw / 4);
      }
  }

  // The field, mowed in stripes, from the near edge to past the goal line.
  const zs: number[] = [];
  for (let z = Z_NEAR; z <= Z_GOAL + 10; z += 2.5) zs.push(z);
  for (let i = 0; i < zs.length - 1; i++) {
    const a = project(v, 0, 0, zs[i]);
    const b = project(v, 0, 0, zs[i + 1]);
    ctx.fillStyle = i % 2 ? "#0e5229" : "#11602f";
    ctx.fillRect(0, b.y, w, a.y - b.y + 1);
  }
  // End zone beyond the goal line.
  const gl = project(v, 0, 0, Z_GOAL);
  const back = project(v, 0, 0, Z_GOAL + 10);
  ctx.fillStyle = "#0b3f22";
  ctx.fillRect(0, back.y, w, gl.y - back.y);

  // Yard lines every five yards, sidelines, and hash marks in between.
  const half = 26.5;
  ctx.strokeStyle = "rgba(244,247,242,0.55)";
  for (let z = Z_GOAL; z >= Z_NEAR + 1; z -= 5) {
    const l = project(v, -half, 0, z);
    const r = project(v, half, 0, z);
    ctx.lineWidth = Math.max(0.6, 0.14 * l.s);
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(r.x, r.y);
    ctx.stroke();
  }
  for (const sx of [-half, half]) {
    const n = project(v, sx, 0, Z_NEAR);
    const f = project(v, sx, 0, Z_GOAL + 10);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(n.x, n.y);
    ctx.lineTo(f.x, f.y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(244,247,242,0.4)";
  for (let z = Z_GOAL - 1; z > Z_NEAR + 1; z -= 1) {
    for (const hx of [-3.08, 3.08]) {
      const a = project(v, hx - 0.33, 0, z);
      const b = project(v, hx + 0.33, 0, z);
      ctx.lineWidth = Math.max(0.5, 0.1 * a.s);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  // Light pooling on the turf under the towers.
  const pool = ctx.createRadialGradient(w / 2, hy + (h - hy) * 0.3, 0, w / 2, hy + (h - hy) * 0.3, w * 0.6);
  pool.addColorStop(0, "rgba(255,243,207,0.1)");
  pool.addColorStop(1, "rgba(255,243,207,0)");
  ctx.fillStyle = pool;
  ctx.fillRect(0, hy, w, h - hy);
}

function paintPosts(ctx: CanvasRenderingContext2D, v: View, glow: number) {
  const base = project(v, 0, 0, Z_GOAL + 0.5);
  const bar = project(v, 0, BAR_H, Z_GOAL + 0.5);
  const l = project(v, -POST_HALF, BAR_H, Z_GOAL + 0.5);
  const r = project(v, POST_HALF, BAR_H, Z_GOAL + 0.5);
  const top = project(v, 0, BAR_H + UPRIGHT_H, Z_GOAL + 0.5);
  const lw = Math.max(1.6, 0.22 * base.s);
  ctx.save();
  ctx.strokeStyle = "#ffd447";
  ctx.lineCap = "round";
  ctx.shadowColor = `rgba(255,212,71,${0.35 + glow * 0.65})`;
  ctx.shadowBlur = 8 + glow * 30;
  ctx.lineWidth = lw * 1.3;
  ctx.beginPath();
  ctx.moveTo(base.x, base.y);
  ctx.lineTo(bar.x, bar.y);
  ctx.moveTo(l.x, l.y);
  ctx.lineTo(r.x, r.y);
  ctx.moveTo(l.x, l.y);
  ctx.lineTo(l.x, top.y);
  ctx.moveTo(r.x, r.y);
  ctx.lineTo(r.x, top.y);
  ctx.stroke();
  ctx.restore();
}

// Where the ball is at flight progress p (0 → 1): off the tee, over the bar, into the net area.
function ballAt(p: number) {
  const z = Z_SPOT + (Z_GOAL + 9 - Z_SPOT) * p;
  const y = 0.3 + 4 * 11.5 * p * (1 - p) * (1 - 0.15 * p);
  const x = Math.sin(p * Math.PI) * 0.8 - p * 0.4;
  return { x, y, z };
}

function paintBall(ctx: CanvasRenderingContext2D, v: View, p: number, spin: number) {
  // Trail: fading ghosts along the path just flown.
  for (let i = 9; i >= 1; i--) {
    const q = p - i * 0.012;
    if (q <= 0) continue;
    const b = ballAt(q);
    const s = project(v, b.x, b.y, b.z);
    ctx.fillStyle = `rgba(255,243,207,${0.06 * (1 - i / 10)})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, Math.max(1.4, 0.32 * s.s), 0, Math.PI * 2);
    ctx.fill();
  }
  const b = ballAt(p);
  const s = project(v, b.x, b.y, b.z);
  // Shadow on the turf.
  const g = project(v, b.x, 0, b.z);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(g.x, g.y, Math.max(1.5, 0.34 * g.s), Math.max(0.6, 0.1 * g.s), 0, 0, Math.PI * 2);
  ctx.fill();
  // The ball, tumbling end over end: its long axis foreshortens as it turns.
  const rx = Math.max(2.2, 0.3 * s.s);
  const ry = Math.max(1.4, rx * (0.6 + 0.4 * Math.abs(Math.cos(spin))));
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(-0.5);
  ctx.shadowColor = "rgba(255,243,207,0.5)";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#8a3b12";
  ctx.beginPath();
  ctx.ellipse(0, 0, ry, rx, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,200,150,0.35)";
  ctx.beginPath();
  ctx.ellipse(-ry * 0.3, -rx * 0.25, ry * 0.35, rx * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  if (Math.cos(spin) > -0.2) {
    ctx.strokeStyle = "rgba(244,247,242,0.9)";
    ctx.lineWidth = Math.max(0.6, rx * 0.12);
    ctx.beginPath();
    ctx.moveTo(0, -rx * 0.45);
    ctx.lineTo(0, rx * 0.45);
    ctx.stroke();
  }
  ctx.restore();
}

export default function FieldGoalBackdrop({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bg = document.createElement("canvas");
    const bgx = bg.getContext("2d")!;
    let view: View = { w: 0, h: 0, cx: 0, hy: 0, f: 1 };
    let dpr = 1;
    let raf = 0;
    let visible = true;
    let t0 = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      for (const c of [canvas, bg]) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      // Wide screens put the posts top right, beside the headline; phones put them above the scoreboard.
      const wide = w > 900;
      const hy = h * (wide ? 0.3 : 0.2);
      view = { w, h, cx: wide ? w * 0.86 : w * 0.74, hy, f: ((h - hy) * Z_NEAR) / CAM_H };
      bgx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintStadium(bgx, view);
    };

    const frame = (now: number) => {
      const t = (now - t0) % LOOP_MS;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(bg, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const p = Math.min(1, Math.max(0, (t - SNAP_MS) / FLIGHT_MS));
      // The posts flare as the ball clears the bar, then settle.
      const through = 0.83;
      const glow = p > through ? Math.max(0, 1 - (t - SNAP_MS - through * FLIGHT_MS) / 1400) : 0;
      paintPosts(ctx, view, glow);
      if (t > SNAP_MS && p < 1) paintBall(ctx, view, p, p * Math.PI * 7);
      if (glow > 0) {
        const s = project(view, 0, BAR_H + 5, Z_GOAL);
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, view.w * 0.25);
        g.addColorStop(0, `rgba(255,212,71,${0.22 * glow})`);
        g.addColorStop(1, "rgba(255,212,71,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, view.w, view.h);
      }
    };

    const loop = (now: number) => {
      frame(now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (reduced || raf || !visible || document.hidden) return;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    if (reduced) {
      // One still frame: the ball hanging at the top of its arc.
      t0 = performance.now() - (SNAP_MS + FLIGHT_MS * 0.5);
      frame(performance.now());
    } else start();

    const ro = new ResizeObserver(() => {
      resize();
      frame(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none block h-full w-full ${className}`} />;
}
