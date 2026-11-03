"use client";

import Link from "next/link";
import { useState } from "react";
import { CONFERENCES, TEAMS, isAlive, type Conference, type Team } from "@/config/candidates";
import { STAGES } from "@/config/race";
import { fmtOdds } from "@/lib/format";
import { useTeamRows, type TeamRow } from "@/lib/market-context";
import { ROAD, championOf, currentColumn, reachedColumn, survival, winner } from "@/lib/race";
import Badge from "../Badge";
import TeamBadge from "../TeamBadge";

const whenOf = (i: number) => STAGES.find((s) => s.id === ROAD[i].stages[0])!.when;

function sortRows(rows: TeamRow[]) {
  return [...rows].sort((a, b) => survival(b) - survival(a) || (b.odds ?? -1) - (a.odds ?? -1));
}

// One team in the bracket. `ended` marks the column where an eliminated team's run ended.
function Chip({ r, ended }: { r: TeamRow; ended: boolean }) {
  const out = ended && !isAlive(r);
  const crowned = r.status === "nominee" || r.status === "winner";
  return (
    <Link
      href={`/teams/#${r.id}`}
      title={`${r.name}${out ? " (eliminated)" : ""}`}
      className={`flex min-w-0 items-center gap-1.5 rounded border px-1.5 py-1 transition hover:-translate-y-0.5 hover:border-amber ${
        crowned ? "border-amber bg-amber text-ink" : out ? "border-chalk/10 bg-ink opacity-45" : "border-chalk/15 bg-night-3"
      }`}
    >
      <TeamBadge c={r} size={22} dim={false} />
      <span className={`min-w-0 flex-1 truncate font-narrow text-[12px] font-bold uppercase tracking-[0.04em] ${out ? "line-through" : ""}`}>{r.nickname}</span>
      <span className="font-mono text-[11px] tabular-nums opacity-80">{fmtOdds(r.odds)}</span>
    </Link>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="rounded border border-dashed border-chalk/20 px-2 py-2 text-center font-narrow text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">{label}</div>
  );
}

function Column({ conf, i, rows, className = "flex min-w-0 flex-col gap-1.5" }: { conf: Conference; i: number; rows: TeamRow[]; className?: string }) {
  const cur = currentColumn();
  const list = sortRows(rows.filter((r) => r.conference === conf && reachedColumn(r) >= i));
  return (
    <div className={className}>
      {i > cur && list.length === 0 ? <Placeholder label={i === ROAD.length - 1 ? "Champion" : "TBD"} /> : list.map((r) => <Chip key={r.id} r={r} ended={reachedColumn(r) === i} />)}
    </div>
  );
}

function FinalSlot({ conf }: { conf: Conference }) {
  const c = championOf(conf);
  return (
    <div className="rounded-md border border-chalk/15 bg-night-2 p-2 shadow-panel">
      <div className="font-narrow text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: CONFERENCES[conf].text }}>
        {conf} champion
      </div>
      {c ? (
        <div className="mt-1 flex items-center gap-2">
          <TeamBadge c={c} size={30} />
          <span className="truncate font-bold">{c.name}</span>
        </div>
      ) : (
        <div className="mt-1 font-display text-lg uppercase tracking-[0.02em] text-chalk/50">To be decided</div>
      )}
    </div>
  );
}

function Final() {
  const w = winner();
  return (
    <div className="flex flex-col gap-2">
      <div className="text-center font-narrow text-[11px] font-bold uppercase tracking-[0.24em] text-amber">Feb 14, 2027 · SoFi Stadium</div>
      <FinalSlot conf="AFC" />
      <div className="text-center font-display text-2xl text-amber">VS</div>
      <FinalSlot conf="NFC" />
      <div className="mt-2 rounded-lg border border-amber bg-ink p-3 text-center shadow-glow">
        {w ? (
          <Crowned c={w} label="◆ Champion" />
        ) : (
          <>
            <Badge size={60} className="mx-auto" />
            <div className="mt-2 font-display text-xl uppercase leading-tight tracking-[0.02em]">Super Bowl LXI</div>
            <div className="font-narrow text-[11px] font-bold uppercase tracking-[0.2em] text-chalk/60">One champion</div>
          </>
        )}
      </div>
    </div>
  );
}

function Crowned({ c, label }: { c: Team; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <TeamBadge c={c} size={56} />
      <div className="font-narrow text-[11px] font-bold uppercase tracking-[0.2em] text-amber">{label}</div>
      <div className="font-display text-xl leading-tight tracking-[0.02em]">{c.name}</div>
    </div>
  );
}

export default function Bracket() {
  const rows = useTeamRows();
  const cur = currentColumn();
  const [tab, setTab] = useState(Math.min(cur, ROAD.length));
  const head = (i: number) => (
    <div className={`mb-2 border-b-2 pb-1.5 ${i === cur ? "border-amber" : "border-chalk/15"}`}>
      <div className={`font-narrow text-xs font-bold uppercase tracking-[0.16em] ${i === cur ? "text-amber" : "text-chalk/80"}`}>
        {ROAD[i].short} {i === cur && "●"}
      </div>
      <div className="font-narrow text-[10px] uppercase tracking-[0.14em] text-chalk/45">{whenOf(i)}</div>
    </div>
  );

  return (
    <>
      {/* Desktop: the AFC runs left → centre, the NFC right → centre, the Super Bowl in the middle. */}
      <div className="hidden xl:block">
        <div className="mb-3 grid grid-cols-[repeat(4,minmax(0,1fr))_minmax(200px,1.3fr)_repeat(4,minmax(0,1fr))] gap-3 font-display text-lg uppercase tracking-[0.04em]">
          <div className="col-span-4" style={{ color: CONFERENCES.AFC.text }}>
            AFC →
          </div>
          <div />
          <div className="col-span-4 text-right" style={{ color: CONFERENCES.NFC.text }}>
            ← NFC
          </div>
        </div>
        <div className="grid grid-cols-[repeat(4,minmax(0,1fr))_minmax(200px,1.3fr)_repeat(4,minmax(0,1fr))] gap-3">
          {ROAD.map((_, i) => (
            <div key={`A${i}`}>
              {head(i)}
              <Column conf="AFC" i={i} rows={rows} />
            </div>
          ))}
          <Final />
          {[...ROAD.keys()].reverse().map((i) => (
            <div key={`N${i}`}>
              {head(i)}
              <Column conf="NFC" i={i} rows={rows} />
            </div>
          ))}
        </div>
        <p className="mt-6 text-center font-narrow text-xs font-bold uppercase tracking-[0.16em] text-chalk/50">
          The {TEAMS.length} coin teams only · seeds and matchups fill in when the playoff field is set
        </p>
      </div>

      {/* Mobile & tablet: one round at a time. */}
      <div className="xl:hidden">
        <div role="tablist" aria-label="Round" className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {[...ROAD.map((r) => r.short), "Feb 14"].map((label, i) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={tab === i}
              onClick={() => setTab(i)}
              className={`shrink-0 rounded-md border px-3 py-2 font-narrow text-sm font-bold uppercase tracking-[0.12em] ${
                tab === i ? "border-amber bg-amber text-ink" : i === cur ? "border-amber text-amber" : "border-chalk/25 text-chalk/75"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mb-3 font-narrow text-sm font-bold uppercase tracking-[0.16em] text-chalk/70">
          {tab < ROAD.length ? `${ROAD[tab].label} · ${whenOf(tab)}` : "Super Bowl LXI · Feb 14, 2027"}
          {tab === cur && <span className="ml-2 text-amber">● Now</span>}
          {tab < cur && <span className="ml-2 text-chalk/50">Decided</span>}
        </div>
        {tab < ROAD.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {(["AFC", "NFC"] as const).map((p) => (
              <div key={p}>
                <div className="mb-2 font-display text-base uppercase tracking-[0.04em]" style={{ color: CONFERENCES[p].text }}>
                  {p}
                </div>
                <Column conf={p} i={tab} rows={rows} className="grid grid-cols-2 gap-1.5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-sm">
            <Final />
          </div>
        )}
      </div>
    </>
  );
}
