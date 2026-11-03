"use client";

import { useState } from "react";
import { CANDIDATES, PARTIES } from "@/config/candidates";
import { EVENTS, stageLabel, type RaceEvent } from "@/config/race";
import { useNow } from "@/lib/useNow";
import { PartyTag } from "../Avatar";
import { Segmented } from "../ui";

type Filter = "upcoming" | "past" | "all";

// Drop-outs with a date show up in the calendar as decided events.
const DROPOUTS: RaceEvent[] = CANDIDATES.filter((c) => c.status === "out" && c.outDate).map((c) => ({
  id: `out-${c.id}`,
  title: `${c.name} drops out`,
  stage: c.outAt ?? "field",
  date: c.outDate!,
  place: PARTIES[c.party].name,
  party: c.party,
  result: "Out",
}));

const ALL = [...EVENTS, ...DROPOUTS];
const dayEnd = (d: string) => Date.parse(`${d}T23:59:59-05:00`);
const isPast = (e: RaceEvent, now: number) => !!e.result || (e.date !== null && dayEnd(e.date) < now);
const sortKey = (e: RaceEvent) => (e.date ? Date.parse(e.date) : Infinity);

function monthLabel(e: RaceEvent) {
  return e.date ? new Date(e.date).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }) : "Date TBD";
}

export default function Calendar() {
  const now = useNow();
  const [filter, setFilter] = useState<Filter>("upcoming");
  const t = now ?? 0;

  let list = ALL.filter((e) => (filter === "all" ? true : filter === "past" ? isPast(e, t) : !isPast(e, t)));
  const emptyUpcoming = filter === "upcoming" && list.length === 0;
  if (emptyUpcoming) list = ALL;
  list = [...list].sort((a, b) => (filter === "past" ? sortKey(b) - sortKey(a) : sortKey(a) - sortKey(b)));

  const groups: { label: string; events: RaceEvent[] }[] = [];
  for (const e of list) {
    const label = monthLabel(e);
    const g = groups.at(-1);
    if (g?.label === label) g.events.push(e);
    else groups.push({ label, events: [e] });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Calendar filter"
          value={filter}
          onChange={setFilter}
          options={[
            { v: "upcoming", l: "Upcoming" },
            { v: "past", l: "Past" },
            { v: "all", l: "All" },
          ]}
        />
        <span className="font-narrow text-xs font-bold uppercase tracking-[0.18em] text-cream/55">Dates are added as they're announced</span>
      </div>

      {now !== null && list.length === 0 ? (
        <div className="border-[3px] border-dashed border-cream/25 px-4 py-10 text-center font-slab text-xl uppercase text-cream/60">
          Nothing decided yet
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.label}>
              <h3 className="mb-3 flex items-center gap-2 font-narrow text-sm font-bold uppercase tracking-[0.28em] text-gold">
                <span aria-hidden="true" className="h-1 w-3 bg-gold" />
                {g.label}
              </h3>
              <ul className="grid gap-3 md:grid-cols-2">
                {g.events.map((e) => (
                  <EventCard key={e.id} e={e} past={isPast(e, t)} today={!!e.date && now !== null && new Date(now).toISOString().slice(0, 10) === e.date} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ e, past, today }: { e: RaceEvent; past: boolean; today: boolean }) {
  const d = e.date ? new Date(`${e.date}T12:00:00Z`) : null;
  return (
    <li
      className={`flex border-[3px] ${today ? "border-red-hot shadow-brutal-red" : "border-cream/80 shadow-brutal-md"} ${past ? "bg-ink opacity-75" : "bg-ink-2"}`}
    >
      <div className={`flex w-20 shrink-0 flex-col items-center justify-center border-r-[3px] border-cream/30 py-3 ${past ? "bg-ink-3" : "bg-gold text-ink"}`}>
        {d ? (
          <>
            <span className="font-narrow text-xs font-bold uppercase tracking-[0.2em]">{d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })}</span>
            <span className="font-slab text-3xl leading-none">{d.getUTCDate()}</span>
            <span className="font-narrow text-[11px] font-bold">{d.getUTCFullYear()}</span>
          </>
        ) : (
          <>
            <span className="font-slab text-xl leading-none">TBD</span>
            <span className="mt-1 px-1 text-center font-narrow text-[10px] font-bold uppercase leading-tight tracking-[0.1em]">{e.when}</span>
          </>
        )}
      </div>
      <div className="min-w-0 flex-1 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {today && <span className="bg-red-hot px-1.5 py-0.5 font-narrow text-[11px] font-bold uppercase tracking-[0.16em] text-cream">● Today</span>}
          {e.party && <PartyTag party={e.party} />}
          <span className="font-narrow text-[11px] font-bold uppercase tracking-[0.16em] text-cream/55">{stageLabel(e.stage)}</span>
        </div>
        <div className="mt-1 font-slab text-lg uppercase leading-tight">{e.title}</div>
        <div className="mt-0.5 text-sm text-cream/65">{e.place}</div>
        {e.result && <div className="mt-1 font-narrow text-sm font-bold uppercase tracking-[0.14em] text-gold">{e.result}</div>}
      </div>
    </li>
  );
}
