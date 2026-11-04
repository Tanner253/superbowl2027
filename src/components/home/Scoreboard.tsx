"use client";

import { useEffect, useState } from "react";
import { TEAMS, isAlive } from "@/config/candidates";
import { CURRENT_STAGE, nextDatedEvent, stageLabel, upcomingEvents } from "@/config/race";
import { SITE } from "@/config/site";
import { fmtDate } from "@/lib/format";
import { useMarket } from "@/lib/market-context";
import { pad2, splitDuration, useNow } from "@/lib/useNow";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { nextCycleTarget } from "../Countdown";
import FlipTile from "../FlipTile";
import TeamBadge from "../TeamBadge";
import { LiveDot } from "../ui";

const PANELS = ["Next round", "Next burn", "Teams alive", "Up next"] as const;
const ROTATE_MS = 9000;

// The jumbotron: one LED scoreboard that cycles through the season's key numbers.
export default function Scoreboard() {
  const [panel, setPanel] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (paused || reduced) return;
    const t = setInterval(() => setPanel((p) => (p + 1) % PANELS.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, reduced]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Season scoreboard"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative overflow-hidden rounded-xl border-2 border-chalk/15 bg-ink/90 shadow-panel backdrop-blur-sm"
    >
      <div className="scanlines pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative flex items-center justify-between gap-3 border-b border-chalk/10 bg-night-2/80 px-4 py-2.5">
        <span className="flex items-center gap-2 font-narrow text-sm font-bold uppercase tracking-[0.22em] text-amber">
          <LiveDot /> ${SITE.ticker}
        </span>
        <span className="font-narrow text-xs font-bold uppercase tracking-[0.22em] text-chalk/70">{stageLabel(CURRENT_STAGE)}</span>
      </div>

      <div className="relative min-h-[300px] p-5 sm:min-h-[280px] sm:p-6" aria-live="polite">
        <div key={panel} className="animate-rise">
          {panel === 0 && <NextRound />}
          {panel === 1 && <NextBurn />}
          {panel === 2 && <Remaining />}
          {panel === 3 && <UpNext />}
        </div>
      </div>

      <div className="relative flex items-center justify-center gap-2 border-t border-chalk/10 bg-night-2/80 px-4 py-2">
        {PANELS.map((name, i) => (
          <button
            key={name}
            type="button"
            onClick={() => {
              setPanel(i);
              setPaused(true);
            }}
            aria-label={`Show ${name}`}
            aria-pressed={i === panel}
            className="flex h-8 items-center px-1.5"
          >
            <span className={`block h-1.5 rounded-full transition-all ${i === panel ? "w-7 bg-amber shadow-[0_0_8px_var(--color-amber)]" : "w-2 bg-chalk/35"}`} />
          </button>
        ))}
      </div>
    </section>
  );
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-[clamp(24px,3vw,32px)] uppercase leading-none tracking-[0.02em]">{children}</h2>;
}

function NextRound() {
  const now = useNow();
  const event = now === null ? null : nextDatedEvent(now);
  const target = event?.date ? Date.parse(`${event.date}T00:00:00-05:00`) : Date.parse(SITE.gameDay);
  const d = now === null ? null : splitDuration(target - now);
  return (
    <>
      <PanelTitle>
        Next round <em className="not-italic text-amber">in</em>
      </PanelTitle>
      <div className="mt-5 flex gap-2 sm:gap-3">
        <FlipTile size="lg" value={d ? String(d.days) : "—"} unit="Days" />
        <FlipTile size="lg" value={d ? pad2(d.hours) : "—"} unit="Hours" />
        <FlipTile size="lg" value={d ? pad2(d.mins) : "—"} unit="Mins" />
        <FlipTile size="lg" value={d ? pad2(d.secs) : "—"} unit="Secs" />
      </div>
      <p className="mt-4 font-narrow text-base font-bold uppercase tracking-[0.18em] text-chalk/85">
        {event ? `${event.title} · ${fmtDate(event.date!, true)}` : `${SITE.gameName} · Feb 14, 2027`}
      </p>
    </>
  );
}

function NextBurn() {
  const { stats } = useMarket();
  const now = useNow();
  const target = now === null ? null : nextCycleTarget(stats?.nextCycleAt, stats?.cycleIntervalMs ?? 900_000, now);
  const d = now !== null && target !== null ? splitDuration(target - now) : null;
  return (
    <>
      <PanelTitle>
        Next <em className="not-italic text-red-hot">burn</em> in
      </PanelTitle>
      {d ? (
        <div className="mt-5 flex gap-2 sm:gap-3">
          <FlipTile size="lg" value={pad2(d.hours + d.days * 24)} unit="Hours" />
          <FlipTile size="lg" value={pad2(d.mins)} unit="Mins" />
          <FlipTile size="lg" value={pad2(d.secs)} unit="Secs" />
        </div>
      ) : (
        <div className="mt-5 rounded-md border border-dashed border-chalk/30 px-4 py-6 text-center font-display text-2xl uppercase tracking-[0.04em] text-chalk/80">
          Burns start at launch
        </div>
      )}
      <p className="mt-4 font-narrow text-sm font-bold uppercase tracking-[0.18em] text-chalk/70">
        Creator fees claimed &amp; routed on-chain every 15 minutes
      </p>
    </>
  );
}

function Remaining() {
  const alive = TEAMS.filter(isAlive);
  return (
    <>
      <div className="flex items-end gap-3">
        <span className="led-text font-display text-[clamp(60px,8vw,88px)] leading-[0.8]">{alive.length}</span>
        <PanelTitle>
          Teams
          <br />
          still alive
        </PanelTitle>
      </div>
      <ul className="mt-5 grid grid-cols-6 gap-x-1 gap-y-2 sm:grid-cols-8">
        {alive.map((c) => (
          <li key={c.id} className="flex flex-col items-center gap-0.5">
            <TeamBadge c={c} size={34} />
            <span className="max-w-full truncate font-narrow text-[10px] font-bold uppercase tracking-[0.06em] text-chalk/75">{c.nickname}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 font-narrow text-sm font-bold uppercase tracking-[0.22em] text-red-hot">Win or go home</p>
    </>
  );
}

function UpNext() {
  const now = useNow();
  const events = now === null ? [] : upcomingEvents(now).slice(0, 3);
  return (
    <>
      <PanelTitle>Up next</PanelTitle>
      <ul className="mt-4 space-y-2">
        {events.map((e) => (
          <li key={e.id} className="flex items-center gap-3 rounded-md border border-chalk/10 bg-night-2 px-3 py-2">
            <span className="w-20 shrink-0 font-narrow text-sm font-bold uppercase tracking-[0.12em] text-amber">{e.date ? fmtDate(e.date) : "TBD"}</span>
            <span className="min-w-0">
              <span className="block truncate font-bold">{e.title}</span>
              <span className="block truncate font-narrow text-xs uppercase tracking-[0.14em] text-chalk/60">
                {e.date ? new Date(e.date).getUTCFullYear() : e.when} · {e.place}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
