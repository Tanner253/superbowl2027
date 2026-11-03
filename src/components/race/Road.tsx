"use client";

import Link from "next/link";
import { useState } from "react";
import { CANDIDATES, PARTIES, isAlive, type Candidate, type Party } from "@/config/candidates";
import { STAGES } from "@/config/race";
import { fmtOdds } from "@/lib/format";
import { useCandidateRows, type CandidateRow } from "@/lib/market-context";
import { ROAD, currentColumn, nomineeOf, reachedColumn, survival, winner } from "@/lib/race";
import Avatar from "../Avatar";
import Seal from "../Seal";

const whenOf = (i: number) => STAGES.find((s) => s.id === ROAD[i].stages[0])!.when;

function sortRows(rows: CandidateRow[]) {
  return [...rows].sort((a, b) => survival(b) - survival(a) || (b.odds ?? -1) - (a.odds ?? -1));
}

// One candidate in the bracket. `final` marks the column where an out candidate's run ended.
function Chip({ r, ended }: { r: CandidateRow; ended: boolean }) {
  const out = ended && !isAlive(r);
  const crowned = r.status === "nominee" || r.status === "winner";
  return (
    <Link
      href={`/candidates/#${r.id}`}
      title={`${r.name}${out ? " (dropped out)" : ""}`}
      className={`flex min-w-0 items-center gap-1.5 border-2 px-1.5 py-1 transition hover:-translate-y-0.5 hover:border-gold ${
        crowned ? "border-ink bg-gold text-ink" : out ? "border-cream/10 bg-ink opacity-45" : "border-cream/20 bg-navy-2"
      }`}
    >
      <Avatar c={r} size={22} dim={false} />
      <span className={`min-w-0 flex-1 truncate font-narrow text-[12px] font-bold uppercase tracking-[0.04em] ${out ? "line-through" : ""}`}>
        {r.ticker}
      </span>
      <span className="font-mono text-[11px] tabular-nums opacity-80">{fmtOdds(r.odds)}</span>
    </Link>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="border-2 border-dashed border-cream/20 px-2 py-2 text-center font-narrow text-[11px] font-bold uppercase tracking-[0.14em] text-cream/40">
      {label}
    </div>
  );
}

function Column({
  party,
  i,
  rows,
  className = "flex min-w-0 flex-col gap-1.5",
}: {
  party: Party;
  i: number;
  rows: CandidateRow[];
  className?: string;
}) {
  const cur = currentColumn();
  const list = sortRows(rows.filter((r) => r.party === party && reachedColumn(r) >= i));
  return (
    <div className={className}>
      {i > cur && list.length === 0 ? (
        <Placeholder label={i === ROAD.length - 1 ? "Nominee" : "TBD"} />
      ) : (
        list.map((r) => <Chip key={r.id} r={r} ended={reachedColumn(r) === i} />)
      )}
    </div>
  );
}

function FinalSlot({ party }: { party: Party }) {
  const c = nomineeOf(party);
  const p = PARTIES[party];
  return (
    <div className="border-[3px] border-ink bg-ink-3 p-2 shadow-brutal-sm">
      <div className="font-narrow text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: party === "R" ? "var(--color-red-hot)" : "var(--color-sky)" }}>
        {p.adj} nominee
      </div>
      {c ? (
        <div className="mt-1 flex items-center gap-2">
          <Avatar c={c} size={30} />
          <span className="truncate font-bold">{c.name}</span>
        </div>
      ) : (
        <div className="mt-1 font-slab text-lg text-cream/50">To be decided</div>
      )}
    </div>
  );
}

function Final() {
  const w = winner();
  const indieNominee = CANDIDATES.find((c) => c.party === "I" && (c.status === "nominee" || c.status === "winner"));
  return (
    <div className="flex flex-col gap-2">
      <div className="text-center font-narrow text-[11px] font-bold uppercase tracking-[0.24em] text-gold">Nov 7, 2028</div>
      <FinalSlot party="R" />
      <div className="text-center font-slab text-xl text-gold">VS</div>
      <FinalSlot party="D" />
      {indieNominee && <WinnerOrNominee c={indieNominee} label="Independent" />}
      <div className="mt-2 border-[3px] border-gold bg-ink p-3 text-center shadow-brutal-gold">
        {w ? (
          <WinnerOrNominee c={w} label="★ President-elect" />
        ) : (
          <>
            <Seal size={56} className="mx-auto" />
            <div className="mt-2 font-slab text-lg uppercase leading-tight">President</div>
            <div className="font-narrow text-[11px] font-bold uppercase tracking-[0.2em] text-cream/60">Elected Nov 7</div>
          </>
        )}
      </div>
    </div>
  );
}

function WinnerOrNominee({ c, label }: { c: Candidate; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <Avatar c={c} size={56} />
      <div className="font-narrow text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{label}</div>
      <div className="font-slab text-lg leading-tight">{c.name}</div>
    </div>
  );
}

export default function Road() {
  const rows = useCandidateRows();
  const cur = currentColumn();
  const indies = sortRows(rows.filter((r) => r.party === "I"));
  const [tab, setTab] = useState(Math.min(cur, ROAD.length));
  const head = (i: number) => (
    <div className={`mb-2 border-b-[3px] pb-1.5 ${i === cur ? "border-gold" : "border-cream/15"}`}>
      <div className={`font-narrow text-xs font-bold uppercase tracking-[0.16em] ${i === cur ? "text-gold" : "text-cream/80"}`}>
        {ROAD[i].short} {i === cur && "●"}
      </div>
      <div className="font-narrow text-[10px] uppercase tracking-[0.14em] text-cream/45">{whenOf(i)}</div>
    </div>
  );

  return (
    <>
      {/* Desktop: Republicans run left → centre, Democrats right → centre, the final in the middle. */}
      <div className="hidden xl:block">
        <div className="mb-3 grid grid-cols-[repeat(4,minmax(0,1fr))_minmax(190px,1.3fr)_repeat(4,minmax(0,1fr))] gap-3 font-slab text-sm uppercase">
          <div className="col-span-4" style={{ color: "var(--color-red-hot)" }}>
            Republicans →
          </div>
          <div />
          <div className="col-span-4 text-right" style={{ color: "var(--color-sky)" }}>
            ← Democrats
          </div>
        </div>
        <div className="grid grid-cols-[repeat(4,minmax(0,1fr))_minmax(190px,1.3fr)_repeat(4,minmax(0,1fr))] gap-3">
          {ROAD.map((_, i) => (
            <div key={`R${i}`}>
              {head(i)}
              <Column party="R" i={i} rows={rows} />
            </div>
          ))}
          <Final />
          {[...ROAD.keys()].reverse().map((i) => (
            <div key={`D${i}`}>
              {head(i)}
              <Column party="D" i={i} rows={rows} />
            </div>
          ))}
        </div>
        {indies.length > 0 && (
          <div className="mx-auto mt-8 max-w-xl border-[3px] border-gold/60 bg-ink-2 p-3">
            <div className="mb-2 font-narrow text-xs font-bold uppercase tracking-[0.2em] text-gold">Independents · their own road to Nov 7</div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {indies.map((r) => (
                <Chip key={r.id} r={r} ended />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile & tablet: one stage at a time. */}
      <div className="xl:hidden">
        <div role="tablist" aria-label="Race stage" className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {[...ROAD.map((r) => r.short), "Nov 7"].map((label, i) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={tab === i}
              onClick={() => setTab(i)}
              className={`shrink-0 border-2 px-3 py-2 font-narrow text-sm font-bold uppercase tracking-[0.12em] ${
                tab === i ? "border-ink bg-gold text-ink" : i === cur ? "border-gold text-gold" : "border-cream/30 text-cream/75"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mb-3 font-narrow text-sm font-bold uppercase tracking-[0.16em] text-cream/70">
          {tab < ROAD.length ? `${ROAD[tab].label} · ${whenOf(tab)}` : "Election Day · Nov 7, 2028"}
          {tab === cur && <span className="ml-2 text-gold">● Now</span>}
          {tab < cur && <span className="ml-2 text-cream/50">Decided</span>}
        </div>
        {tab < ROAD.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {(["R", "D"] as const).map((p) => (
              <div key={p}>
                <div className="mb-2 font-slab text-sm uppercase" style={{ color: p === "R" ? "var(--color-red-hot)" : "var(--color-sky)" }}>
                  {PARTIES[p].plural}
                </div>
                <Column party={p} i={tab} rows={rows} className="grid grid-cols-2 gap-1.5" />
              </div>
            ))}
            {tab === 0 && indies.length > 0 && (
              <div className="sm:col-span-2">
                <div className="mb-2 font-slab text-sm uppercase text-gold">Independents</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {indies.map((r) => (
                    <Chip key={r.id} r={r} ended />
                  ))}
                </div>
              </div>
            )}
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
