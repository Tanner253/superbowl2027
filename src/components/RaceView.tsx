"use client";

import { useEffect, useState } from "react";
import { CANDIDATES, isAlive } from "@/config/candidates";
import { CURRENT_STAGE, STAGES, stageIndex } from "@/config/race";
import PageHero from "./PageHero";
import Ballot from "./race/Ballot";
import Calendar from "./race/Calendar";
import Road from "./race/Road";
import { Segmented, Wrap } from "./ui";

type View = "road" | "calendar" | "ballot";
const VIEWS: View[] = ["road", "calendar", "ballot"];

export default function RaceView() {
  const [view, setView] = useState<View>("road");
  const alive = CANDIDATES.filter(isAlive).length;
  const current = stageIndex(CURRENT_STAGE);

  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("view") as View | null;
    if (v && VIEWS.includes(v)) setView(v);
  }, []);

  const pick = (v: View) => {
    setView(v);
    const url = new URL(window.location.href);
    url.searchParams.set("view", v);
    if (v !== "ballot") url.searchParams.delete("b");
    history.replaceState(null, "", url);
  };

  const chips = [
    ["Stage", STAGES[current].label],
    ["In the race", `${alive}/${CANDIDATES.length}`],
    ["Election Day", "Nov 7, 2028"],
  ];

  return (
    <>
      <PageHero variant="red" kicker="Road to the White House" title="The Race" subtitle={`${alive} left, one White House. Drop out and go home.`}>
        <div className="mt-6 flex flex-wrap gap-2">
          {chips.map(([k, v]) => (
            <span key={k} className="border-[3px] border-ink bg-ink px-3 py-1.5 font-narrow text-sm font-bold uppercase tracking-[0.14em]">
              <span className="text-cream/60">{k}</span> <span className="text-gold">{v}</span>
            </span>
          ))}
        </div>
      </PageHero>

      <Wrap className="pt-8">
        <ol className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-3 [mask-image:linear-gradient(90deg,#000_85%,transparent)] sm:mx-0 sm:px-0 lg:[mask-image:none]">
          {STAGES.map((s, i) => {
            const state = i < current ? "done" : i === current ? "now" : "next";
            return (
              <li
                key={s.id}
                aria-current={state === "now" ? "step" : undefined}
                className={`min-w-[140px] flex-1 border-[3px] p-3 ${
                  state === "now"
                    ? "border-ink bg-gold text-ink shadow-brutal-red"
                    : state === "done"
                      ? "border-cream/10 bg-ink text-cream/50"
                      : "border-cream/20 bg-ink-2"
                }`}
              >
                <div className="font-narrow text-[11px] font-bold uppercase tracking-[0.18em] opacity-80">
                  {s.when}
                  {state === "now" && " · ● Now"}
                  {state === "done" && " · ✓"}
                </div>
                <div className="mt-1 font-slab text-lg uppercase leading-tight">{s.label}</div>
                {state === "now" && <div className="mt-1 text-sm">{s.blurb}</div>}
              </li>
            );
          })}
        </ol>

        <div className="mb-8 mt-8">
          <Segmented
            label="Race view"
            value={view}
            onChange={pick}
            options={[
              { v: "road", l: "Road" },
              { v: "calendar", l: "Calendar" },
              { v: "ballot", l: "Call the race" },
            ]}
          />
        </div>

        {view === "road" && <Road />}
        {view === "calendar" && <Calendar />}
        {view === "ballot" && <Ballot />}
      </Wrap>
    </>
  );
}
