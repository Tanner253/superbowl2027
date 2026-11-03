"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TEAMS } from "@/config/candidates";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { IconClose, IconFootball, IconMinus } from "../icons";
import TeamBadge from "../TeamBadge";
import { createRenderer } from "./draw";
import { newKickoff, runYards, step, type Input, type World } from "./engine";
import type { GameView } from "./GameProvider";
import { frames, kitFor } from "./sprites";

const BEST_KEY = "sb27_kickreturn_best";
const TEAM_KEY = "sb27_kickreturn_team";

type Screen = "ready" | "playing" | "over";

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};
const displayFont = () => getComputedStyle(document.body).getPropertyValue("--ff-display").trim() || "Impact, sans-serif";

// The kick-return game. Full screen on phones, a floating window on wider screens; minimizes to a
// pill so a run survives page changes. Best score is kept in this browser. Our own game and art.
export default function KickReturn({ view, setView }: { view: GameView; setView: (v: GameView) => void }) {
  const reduced = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const preview = useRef<HTMLCanvasElement>(null);
  const stick = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const renderer = useRef(createRenderer());
  const world = useRef<World>(newKickoff(0, 0, 0));
  const input = useRef<Input>({ left: false, right: false, turbo: false, slow: false, juke: false, steer: null });
  const drag = useRef<{ id: number; x0: number } | null>(null);
  const [screen, setScreen] = useState<Screen>("ready");
  const [teamId, setTeamId] = useState(TEAMS[0].id);
  const [best, setBest] = useState(0);
  const [last, setLast] = useState<{ yards: number; tds: number; reason: string; record: boolean } | null>(null);
  const [paused, setPaused] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [touch, setTouch] = useState(false);
  const team = TEAMS.find((t) => t.id === teamId) ?? TEAMS[0];
  const kitRef = useRef(kitFor(team));
  kitRef.current = kitFor(team);
  const open = view === "open";

  useEffect(() => {
    setBest(Number(read(BEST_KEY)) || 0);
    const t = read(TEAM_KEY);
    if (t && TEAMS.some((x) => x.id === t)) setTeamId(t);
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Phones play full screen: lock the page behind it while it's up.
  useEffect(() => {
    if (!open) {
      if (screen === "playing") setPaused(true);
      return;
    }
    box.current?.focus({ preventScroll: true });
    if (window.innerWidth >= 640) return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = "";
    };
  }, [open, screen]);

  // Canvas sizing.
  const fit = useCallback(() => {
    const cv = canvas.current;
    if (!cv) return null;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = cv.getBoundingClientRect();
    cv.width = Math.round(r.width * dpr);
    cv.height = Math.round(r.height * dpr);
    renderer.current.resize(r.width, r.height, dpr);
    return cv.getContext("2d");
  }, []);

  // A still frame of the field behind the menus.
  useEffect(() => {
    if (!open || screen === "playing") return;
    const draw = () => {
      const ctx = fit();
      if (ctx) renderer.current.frame(ctx, world.current, 0, kitRef.current, displayFont(), false, false);
    };
    draw();
    const ro = new ResizeObserver(draw);
    if (canvas.current) ro.observe(canvas.current);
    return () => ro.disconnect();
  }, [open, screen, teamId, fit]);

  // The selected team's returner on the start screen.
  useEffect(() => {
    const cv = preview.current;
    if (!cv || !open || screen === "playing") return;
    const g = cv.getContext("2d");
    if (!g) return;
    g.clearRect(0, 0, cv.width, cv.height);
    g.drawImage(frames(kitFor(team), "toward", false, 22, displayFont())[1], 0, 0, cv.width, cv.height);
  }, [team, open, screen]);

  const start = useCallback(() => {
    world.current = newKickoff(0, 0, 0);
    input.current = { left: false, right: false, turbo: false, slow: false, juke: false, steer: null };
    setPaused(false);
    setScreen("playing");
    box.current?.focus({ preventScroll: true });
  }, []);

  // The game loop: runs only while the window is open, the tab is visible and play isn't paused.
  useEffect(() => {
    if (!open || screen !== "playing" || paused) return;
    let ctx = fit();
    if (!ctx) return;
    const font = displayFont();
    const ro = new ResizeObserver(() => (ctx = fit()));
    if (canvas.current) ro.observe(canvas.current);
    let raf = 0;
    let prev = performance.now();
    let ended = false;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      if (!document.hidden && ctx) {
        let w = world.current;
        const ev = step(w, input.current, dt, !reduced);
        input.current.juke = false;
        if (w.mode === "td" && w.t > 2.1) world.current = w = newKickoff(w.level + 1, w.banked, w.tds);
        if (ev === "over" && !ended) {
          ended = true;
          const yards = runYards(w);
          const record = yards > (Number(read(BEST_KEY)) || 0);
          if (record) {
            write(BEST_KEY, String(yards));
            setBest(yards);
          }
          setLast({ yards, tds: w.tds, reason: w.endReason, record });
          // Let the hit land on screen before the score card.
          setTimeout(() => setScreen("over"), 1300);
        }
        renderer.current.frame(ctx, world.current, dt, kitRef.current, font, !reduced);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [open, screen, paused, reduced, fit]);

  // Keyboard only while the game has focus, so the page scrolls normally otherwise.
  const key = (e: React.KeyboardEvent, down: boolean) => {
    const i = input.current;
    const k = e.key.toLowerCase();
    if (k === "arrowleft" || k === "a") i.left = down;
    else if (k === "arrowright" || k === "d") i.right = down;
    else if (k === "arrowup" || k === "w" || k === "shift") i.turbo = down;
    else if (k === "arrowdown" || k === "s") i.slow = down;
    else if (k === " " || k === "j") {
      if (down && !e.repeat) i.juke = true;
    } else if (k === "escape" && down) setView("mini");
    else if (k === "enter" && down && screen !== "playing") start();
    else return;
    e.preventDefault();
  };

  // Touch and mouse steering: drag sideways from wherever the thumb goes down.
  const showStick = (x0: number, y0: number, dx: number | null) => {
    const s = stick.current;
    const k = knob.current;
    if (!s || !k) return;
    if (dx === null) {
      s.style.opacity = "0";
      return;
    }
    const r = stage.current!.getBoundingClientRect();
    s.style.opacity = "1";
    s.style.transform = `translate(${x0 - r.left - 36}px, ${y0 - r.top - 36}px)`;
    k.style.transform = `translateX(${Math.max(-26, Math.min(26, dx))}px)`;
  };
  const onDown = (e: React.PointerEvent) => {
    if (screen !== "playing" || paused || (e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x0: e.clientX };
    input.current.steer = 0;
    showStick(e.clientX, e.clientY, 0);
    box.current?.focus({ preventScroll: true });
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    input.current.steer = Math.max(-1, Math.min(1, dx / 44));
    showStick(d.x0, e.clientY, dx);
  };
  const onUp = (e: React.PointerEvent) => {
    if (drag.current?.id !== e.pointerId) return;
    drag.current = null;
    input.current.steer = null;
    showStick(0, 0, null);
  };

  // Dragging the window by its title bar (wider screens only).
  const moveWindow = (e: React.PointerEvent) => {
    if (window.innerWidth < 640 || (e.target as HTMLElement).closest("button")) return;
    const r = box.current!.getBoundingClientRect();
    const dx = e.clientX - r.left;
    const dy = e.clientY - r.top;
    const move = (ev: PointerEvent) =>
      setPos({ x: Math.max(8, Math.min(window.innerWidth - r.width - 8, ev.clientX - dx)), y: Math.max(76, Math.min(window.innerHeight - 80, ev.clientY - dy)) });
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const live = screen === "playing" && !paused;
  const runNow = screen === "playing" ? runYards(world.current) : null;

  return (
    <>
      {view === "mini" && (
        <div className="fixed bottom-4 right-4 z-[55] mb-[env(safe-area-inset-bottom)] flex items-center gap-1 rounded-full border border-amber/50 bg-ink/95 py-1 pl-1 pr-1.5 shadow-glow backdrop-blur-md">
          <button type="button" onClick={() => setView("open")} className="flex items-center gap-2.5 rounded-full py-1.5 pl-2 pr-3 hover:bg-chalk/10">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber text-lg text-ink">
              <IconFootball />
            </span>
            <span className="text-left leading-tight">
              <span className="block font-display text-[15px] uppercase tracking-[0.04em]">Kick Return</span>
              <span className="block font-narrow text-[11px] font-bold uppercase tracking-[0.16em] text-chalk/60">
                {runNow !== null ? `Paused · ${runNow} yds` : `Best ${best} yds`} · <span className="text-amber">Resume</span>
              </span>
            </span>
          </button>
          <button type="button" onClick={() => setView("closed")} aria-label="Close the game" className="rounded-full p-2 text-chalk/60 hover:bg-chalk/10 hover:text-chalk">
            <IconClose />
          </button>
        </div>
      )}

      <div
        ref={box}
        role="dialog"
        aria-label="Kick Return"
        tabIndex={-1}
        hidden={!open}
        onKeyDown={(e) => key(e, true)}
        onKeyUp={(e) => key(e, false)}
        style={pos ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" } : undefined}
        className="fixed inset-0 z-[55] flex flex-col overflow-hidden bg-ink outline-none sm:inset-auto sm:bottom-4 sm:right-4 sm:h-[min(680px,calc(100dvh-96px))] sm:w-[420px] sm:rounded-2xl sm:border sm:border-amber/40 sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,194,61,0.15)]"
      >
        <div
          onPointerDown={moveWindow}
          className="flex shrink-0 select-none items-center gap-2.5 border-b border-chalk/10 bg-gradient-to-b from-night-3 to-night-2 px-3 pb-2 pt-[max(8px,env(safe-area-inset-top))] sm:cursor-grab sm:active:cursor-grabbing"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber text-base text-ink">
            <IconFootball />
          </span>
          <span className="font-display text-lg uppercase tracking-[0.05em]">Kick Return</span>
          <span className="ml-auto rounded-md border border-amber/25 bg-ink px-2 py-1 font-narrow text-[11px] font-bold uppercase tracking-[0.16em] text-chalk/60">
            Best <span className="led-text">{best}</span>
          </span>
          <button type="button" onClick={() => setView("mini")} aria-label="Minimize the game" className="rounded-md p-1.5 text-chalk/70 hover:bg-chalk/10 hover:text-chalk">
            <IconMinus />
          </button>
          <button type="button" onClick={() => setView("closed")} aria-label="Close the game" className="rounded-md p-1.5 text-chalk/70 hover:bg-chalk/10 hover:text-chalk">
            <IconClose />
          </button>
        </div>

        <div ref={stage} className="relative min-h-0 flex-1 touch-none select-none" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <canvas ref={canvas} className="absolute inset-0 h-full w-full" />

          {/* Thumb stick, shown where the drag started. */}
          <div ref={stick} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-[72px] w-[72px] rounded-full border-2 border-chalk/30 bg-chalk/5 opacity-0 transition-opacity">
            <div ref={knob} className="absolute left-1/2 top-1/2 -ml-[18px] -mt-[18px] h-9 w-9 rounded-full bg-amber/80 shadow-glow-sm" />
          </div>

          {touch && live && (
            <>
              <div className="absolute bottom-[max(18px,env(safe-area-inset-bottom))] right-4 flex items-end gap-3">
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    input.current.turbo = true;
                  }}
                  onPointerUp={() => (input.current.turbo = false)}
                  onPointerLeave={() => (input.current.turbo = false)}
                  onPointerCancel={() => (input.current.turbo = false)}
                  className="h-16 w-16 rounded-full border-2 border-lime/70 bg-ink/70 font-narrow text-xs font-bold uppercase tracking-[0.14em] text-lime backdrop-blur-sm active:bg-lime active:text-ink"
                >
                  Turbo
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    input.current.juke = true;
                  }}
                  className="h-20 w-20 rounded-full bg-amber font-display text-xl uppercase tracking-[0.04em] text-ink shadow-glow active:scale-95 active:bg-flood"
                >
                  Juke
                </button>
              </div>
              <div className="pointer-events-none absolute bottom-[max(26px,env(safe-area-inset-bottom))] left-4 font-narrow text-[11px] font-bold uppercase tracking-[0.18em] text-chalk/45">
                ← drag to steer →
              </div>
            </>
          )}

          {screen !== "playing" && (
            <div className="absolute inset-0 overflow-y-auto bg-gradient-to-b from-ink/20 via-ink/70 to-ink/95">
              <div className="flex min-h-full flex-col justify-end gap-4 p-4 sm:p-5">
                {screen === "over" && last ? (
                  <div className="text-center">
                    <div className="font-narrow text-xs font-bold uppercase tracking-[0.28em] text-chalk/75">{last.reason}</div>
                    <div className="led-text mt-1 font-display text-[64px] leading-none tracking-[0.02em]">
                      {last.yards}
                      <span className="ml-2 text-2xl text-chalk/70 [text-shadow:none]">yds</span>
                    </div>
                    <div className="mt-3 flex justify-center gap-2">
                      {[
                        ["Touchdowns", String(last.tds)],
                        ["Best", String(best)],
                      ].map(([k, v]) => (
                        <span key={k} className="rounded-md border border-chalk/15 bg-ink/80 px-3 py-1.5 font-narrow text-xs font-bold uppercase tracking-[0.16em]">
                          <span className="text-chalk/55">{k}</span> <span className="text-amber">{v}</span>
                        </span>
                      ))}
                    </div>
                    {last.record && (
                      <div className="mx-auto mt-3 w-fit rounded-sm bg-amber px-2.5 py-1 font-narrow text-xs font-bold uppercase tracking-[0.2em] text-ink shadow-glow-sm">New personal best</div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-end gap-4">
                    <canvas ref={preview} width={240} height={360} className="h-[138px] w-[92px] shrink-0 drop-shadow-[0_12px_18px_rgba(0,0,0,0.6)]" />
                    <div className="min-w-0 pb-1">
                      <div className="font-narrow text-[11px] font-bold uppercase tracking-[0.3em] text-amber">Signature game</div>
                      <div className="flood-text font-display text-[42px] uppercase leading-[0.9] tracking-[0.02em]">Kick Return</div>
                      <p className="mt-1.5 text-sm text-chalk/80">Field the kick, follow your blockers, find a seam and take it the distance.</p>
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-chalk/10 bg-ink/85 p-3">
                  <div className="mb-2 flex items-center justify-between font-narrow text-[11px] font-bold uppercase tracking-[0.2em]">
                    <span className="text-chalk/55">Your team</span>
                    <span className="truncate pl-2 text-chalk">{team.name}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {TEAMS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTeamId(t.id);
                          write(TEAM_KEY, t.id);
                        }}
                        aria-label={t.name}
                        aria-pressed={t.id === teamId}
                        className={`flex min-w-0 flex-col items-center gap-1 rounded-md border px-1 py-1.5 transition ${
                          t.id === teamId ? "border-amber bg-amber/15" : "border-transparent bg-chalk/[0.04] hover:bg-chalk/10"
                        }`}
                      >
                        <TeamBadge c={t} size={26} />
                        <span className="w-full truncate text-center font-narrow text-[10.5px] font-bold uppercase tracking-[0.02em]">{t.nickname}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={start}
                  className="w-full rounded-xl bg-amber py-4 font-display text-2xl uppercase tracking-[0.06em] text-ink shadow-glow transition hover:bg-flood active:scale-[0.99]"
                >
                  {screen === "over" ? "Run it back" : "Kick off"}
                </button>

                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pb-[env(safe-area-inset-bottom)] font-narrow text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/55">
                  {touch ? (
                    <>
                      <span>Drag to steer</span>
                      <span>Hold Turbo to sprint</span>
                      <span>Tap Juke to make a man miss</span>
                    </>
                  ) : (
                    <>
                      <span>
                        <Kbd>←</Kbd>
                        <Kbd>→</Kbd> steer
                      </span>
                      <span>
                        <Kbd>↑</Kbd> turbo
                      </span>
                      <span>
                        <Kbd>Space</Kbd> juke
                      </span>
                      <span>
                        <Kbd>Esc</Kbd> minimize
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {screen === "playing" && paused && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/75 backdrop-blur-sm">
              <div className="font-narrow text-xs font-bold uppercase tracking-[0.3em] text-amber">Paused</div>
              <div className="flood-text font-display text-5xl uppercase">Timeout</div>
              <button type="button" onClick={() => setPaused(false)} className="rounded-xl bg-amber px-10 py-3 font-display text-xl uppercase tracking-[0.06em] text-ink shadow-glow">
                Resume
              </button>
            </div>
          )}
        </div>
        <div className="sr-only" aria-live="polite">
          {screen === "over" && last ? `${last.reason}. ${last.yards} yards, best ${best}.` : ""}
        </div>
      </div>
    </>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="mr-1 inline-block min-w-[22px] rounded border border-chalk/25 bg-night-3 px-1.5 py-0.5 text-center font-narrow text-[11px] text-chalk">{children}</kbd>;
}
