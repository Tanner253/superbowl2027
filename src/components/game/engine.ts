// Kick Return: the game's rules, separate from drawing and the window around it.
// Field units are yards: x across (0 = left sideline), y downfield (0 = own goal line, 100 = theirs).

export const FIELD_W = 53.3;
export const HASH_X = [23.58, 29.73];

export type Mode = "catch" | "play" | "td" | "over";

// Things the renderer turns into effects: a "JUKE!" pop, the touchdown banner, the hit.
export type GameEvent = "go" | "juke" | "td" | "tackle" | "oob";

export type Player = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  stamina: number;
  turbo: boolean;
  jukeCd: number;
  jukeT: number;
  jukeDir: number;
  inv: number;
  phase: number;
};

export type Defender = { x: number; y: number; vx: number; vy: number; speed: number; stun: number; held: boolean; phase: number; num: number };
export type Blocker = { x: number; y: number; target: number | null; engaged: number; down: boolean; phase: number; num: number };
export type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number };

export type World = {
  mode: Mode;
  t: number;
  level: number;
  // Yards banked from earlier returns this run.
  banked: number;
  tds: number;
  startY: number;
  maxY: number;
  p: Player;
  defenders: Defender[];
  blockers: Blocker[];
  particles: Particle[];
  events: GameEvent[];
  endReason: string;
};

// steer: -1 … 1 from a drag on touch screens (null when not dragging); the keys otherwise.
export type Input = { left: boolean; right: boolean; turbo: boolean; slow: boolean; juke: boolean; steer: number | null };

let seed = 1;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

export function newKickoff(level: number, banked: number, tds: number): World {
  seed = (Date.now() % 2147483646) + 1;
  const startY = 2;
  const count = Math.min(11, 7 + level);
  const defenders: Defender[] = Array.from({ length: count }, (_, i) => {
    const lane = (i + 0.5) / count;
    return {
      x: 3.5 + lane * (FIELD_W - 7) + (rnd() - 0.5) * 3,
      y: startY + 38 + rnd() * 10,
      vx: 0,
      vy: 0,
      speed: Math.min(9.7, 6.2 + level * 0.34 + rnd() * 0.6),
      stun: 0,
      held: false,
      phase: rnd() * 6,
      num: [44, 52, 31, 27, 90, 55, 38, 41, 23, 97, 50][i % 11],
    };
  });
  const blockers: Blocker[] = [13, 21.5, 31.5, 40].map((x, i) => ({ x, y: startY + 10 + (i % 2) * 3, target: null, engaged: 0, down: false, phase: i, num: [85, 46, 33, 80][i] }));
  return {
    mode: "catch",
    t: 0,
    level,
    banked,
    tds,
    startY,
    maxY: startY,
    p: { x: FIELD_W / 2, y: startY, vx: 0, vy: 0, stamina: 100, turbo: false, jukeCd: 0, jukeT: 0, jukeDir: 1, inv: 0, phase: 0 },
    defenders,
    blockers,
    particles: [],
    events: [],
    endReason: "",
  };
}

// Yards this run so far: everything banked plus the current return.
export const runYards = (w: World) => Math.round(w.banked + Math.max(0, w.maxY - w.startY));

// "OWN 23" / "OPP 40": where the ball is.
export const spot = (y: number) => (y < 50 ? `OWN ${Math.max(0, Math.round(y))}` : y < 50.5 ? "MIDFIELD" : `OPP ${Math.max(0, Math.round(100 - y))}`);

const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);

function puff(w: World, x: number, y: number, n: number, color: string) {
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2;
    const s = 1 + rnd() * 4;
    w.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: 0.35 + rnd() * 0.35, color, size: 0.18 + rnd() * 0.22 });
  }
}

function end(w: World, reason: string) {
  const y = w.p.y;
  w.endReason = `${reason} at ${y < 49.5 ? `your own ${Math.max(1, Math.round(y))}` : y <= 50.5 ? "midfield" : `their ${Math.max(1, Math.round(100 - y))}`}`;
  w.mode = "over";
  w.t = 0;
  w.banked = runYards(w);
  w.maxY = w.startY;
}

// Advances the world by dt seconds. Returns "td" or "over" on the frame either happens.
export function step(w: World, input: Input, dt: number, effects: boolean): "td" | "over" | null {
  const p = w.p;
  w.t += dt;
  for (const q of w.particles) {
    q.life += dt;
    q.x += q.vx * dt;
    q.y += q.vy * dt;
    q.vx *= 0.92;
    q.vy *= 0.92;
  }
  w.particles = w.particles.filter((q) => q.life < q.max);

  if (w.mode === "catch") {
    if (w.t > 1.1) {
      w.mode = "play";
      w.t = 0;
      w.events.push("go");
    }
    return null;
  }
  if (w.mode !== "play") return null;

  // Steering: a drag on touch screens, the arrow keys otherwise.
  const axis = input.steer !== null ? input.steer : Number(input.right) - Number(input.left);
  p.vx += (axis * 8.8 - p.vx) * Math.min(1, dt * 10);
  p.turbo = input.turbo && p.stamina > 0;
  const target = p.turbo ? 10.3 : input.slow ? 4.4 : 7.5;
  p.vy += (target - p.vy) * Math.min(1, dt * 4);
  p.stamina = Math.max(0, Math.min(100, p.stamina + (p.turbo ? -34 : 14) * dt));
  p.jukeCd = Math.max(0, p.jukeCd - dt);
  p.inv = Math.max(0, p.inv - dt);

  if (input.juke && p.jukeCd <= 0) {
    // Cut away from the nearest free defender, or the way you're already drifting.
    let near: Defender | null = null;
    for (const d of w.defenders) if (!d.held && (!near || dist(d.x, d.y, p.x, p.y) < dist(near.x, near.y, p.x, p.y))) near = d;
    p.jukeDir = Math.abs(p.vx) > 1 ? Math.sign(p.vx) : near ? (near.x > p.x ? -1 : 1) : 1;
    p.jukeT = 0.18;
    p.jukeCd = 1.4;
    p.inv = 0.45;
    for (const d of w.defenders) if (!d.held && dist(d.x, d.y, p.x, p.y) < 3.6) d.stun = 0.85;
    w.events.push("juke");
    if (effects) puff(w, p.x, p.y, 12, "rgba(220,235,210,0.85)");
  }
  if (p.jukeT > 0) {
    p.jukeT -= dt;
    p.x += p.jukeDir * 17 * dt;
  }
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.phase += Math.hypot(p.vx, p.vy) * dt * 1.25;
  w.maxY = Math.max(w.maxY, p.y);
  if (effects && p.turbo && Math.random() < dt * 14) puff(w, p.x + (Math.random() - 0.5) * 0.6, p.y - 0.4, 1, "rgba(200,220,190,0.5)");

  if (p.x < 0.35 || p.x > FIELD_W - 0.35) {
    w.events.push("oob");
    end(w, "Out of bounds");
    return "over";
  }
  if (p.y >= 100) {
    w.mode = "td";
    w.t = 0;
    w.tds += 1;
    w.banked = runYards(w);
    w.maxY = w.startY;
    w.events.push("td");
    return "td";
  }

  // Blockers: pick up the nearest free defender ahead and hold him up for a moment.
  w.blockers.forEach((b, i) => {
    if (b.down) return;
    b.phase += dt * 7.5;
    if (b.engaged > 0) {
      b.engaged -= dt;
      const d = b.target !== null ? w.defenders[b.target] : null;
      if (d) {
        b.x = d.x + (b.x - d.x) * 0.9;
        b.y = d.y - 0.9;
      }
      if (b.engaged <= 0) {
        b.down = true;
        if (d) d.held = false;
      }
      return;
    }
    let best = -1;
    let bestD = Infinity;
    w.defenders.forEach((d, j) => {
      const taken = w.blockers.some((o, k) => k !== i && o.target === j && !o.down);
      if (d.held || taken || d.y < b.y - 3) return;
      const dd = dist(d.x, d.y, b.x, b.y);
      if (dd < bestD) {
        bestD = dd;
        best = j;
      }
    });
    b.target = best >= 0 ? best : null;
    if (best >= 0) {
      const d = w.defenders[best];
      const k = Math.min(1, (7.6 * dt) / Math.max(0.01, bestD));
      b.x += (d.x - b.x) * k;
      b.y += (d.y - b.y) * k;
      if (bestD < 1.15) {
        b.engaged = Math.max(0.6, 1.5 + rnd() * 0.8 - w.level * 0.08);
        d.held = true;
        d.vx = d.vy = 0;
      }
    } else {
      b.y += p.vy * dt;
      b.x += (p.x + (i - 1.5) * 4 - b.x) * Math.min(1, dt * 2);
    }
  });

  // Coverage: run to where the returner is going, not where he is.
  for (const d of w.defenders) {
    d.phase += dt * 7.5;
    if (d.held) continue;
    if (d.stun > 0) {
      d.stun -= dt;
      d.vx *= 0.9;
      d.vy *= 0.9;
    } else {
      const gap = dist(d.x, d.y, p.x, p.y);
      const lead = Math.min(1.2, (gap / Math.max(1, d.speed)) * 0.55);
      const tx = p.x + p.vx * lead;
      const ty = p.y + p.vy * lead;
      const len = Math.max(0.01, dist(tx, ty, d.x, d.y));
      d.vx += (((tx - d.x) / len) * d.speed - d.vx) * Math.min(1, dt * 3.2);
      d.vy += (((ty - d.y) / len) * d.speed - d.vy) * Math.min(1, dt * 3.2);
    }
    d.x += d.vx * dt;
    d.y += d.vy * dt;
  }
  // Keep the coverage from stacking on one spot.
  for (let i = 0; i < w.defenders.length; i++)
    for (let j = i + 1; j < w.defenders.length; j++) {
      const a = w.defenders[i];
      const b = w.defenders[j];
      const dd = dist(a.x, a.y, b.x, b.y);
      if (dd > 0 && dd < 1.3) {
        const push = ((1.3 - dd) / dd) * 0.5;
        if (!a.held) {
          a.x += (a.x - b.x) * push;
          a.y += (a.y - b.y) * push;
        }
        if (!b.held) {
          b.x += (b.x - a.x) * push;
          b.y += (b.y - a.y) * push;
        }
      }
    }

  if (p.inv <= 0)
    for (const d of w.defenders)
      if (!d.held && dist(d.x, d.y, p.x, p.y) < 0.98) {
        if (effects) puff(w, p.x, p.y, 16, "rgba(220,235,210,0.9)");
        w.events.push("tackle");
        end(w, "Tackled");
        return "over";
      }
  return null;
}
