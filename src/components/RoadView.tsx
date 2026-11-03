"use client";

import { useEffect, useState } from "react";
import { TEAMS, isAlive } from "@/config/candidates";
import { CURRENT_STAGE, STAGES, stageIndex } from "@/config/race";
import PageHero from "./PageHero";
import Bracket from "./road/Bracket";
import Calendar from "./road/Calendar";
import Pickem from "./road/Pickem";
import { Segmented, Wrap } from "./ui";

type View = "road" | "calendar" | "pickem";
const VIEWS: View[] = ["road", "calendar", "pickem"];

export default function RoadView() {
  const [view, setView] = useState<View>("road");
  const alive = TEAMS.filter(isAlive).length;
  const current = stageIndex(CURRENT_STAGE);

  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("view") as View | null;
    if (v && VIEWS.includes(v)) setView(v);
  }, []);

  const pick = (v: View) => {
    setView(v);
    const url = new URL(window.location.href);
    url.searchParams.set("view", v);
    if (v !== "pickem") url.searchParams.delete("b");
    history.replaceState(null, "", url);
  };

  const chips = [
    ["Stage", STAGES[current].label],
    ["Alive", `${alive}/${TEAMS.length}`],
    ["Super Bowl LXI", "Feb 14, 2027"],
  ];

  return (
    <>
      <PageHero variant="afc" kicker="Road to the Super Bowl" title="The Road" subtitle={`${alive} left, one champion. Win or go home.`}>
        <div className="mt-6 flex flex-wrap gap-2">
          {chips.map(([k, v]) => (
            <span key={k} className="rounded-md border border-chalk/15 bg-ink/80 px-3 py-1.5 font-narrow text-sm font-bold uppercase tracking-[0.14em]">
              <span className="text-chalk/60">{k}</span> <span className="text-amber">{v}</span>
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
                className={`min-w-[150px] flex-1 rounded-lg border p-3 ${
                  state === "now"
                    ? "border-amber bg-amber text-ink shadow-glow"
                    : state === "done"
                      ? "border-chalk/10 bg-ink text-chalk/50"
                      : "border-chalk/15 bg-night-2"
                }`}
              >
                <div className="font-narrow text-[11px] font-bold uppercase tracking-[0.18em] opacity-80">
                  {s.when}
                  {state === "now" && " · ● Now"}
                  {state === "done" && " · ✓"}
                </div>
                <div className="mt-1 font-display text-xl uppercase leading-tight tracking-[0.02em]">{s.label}</div>
                {state === "now" && <div className="mt-1 text-sm">{s.blurb}</div>}
              </li>
            );
          })}
        </ol>

        <div className="mb-8 mt-8">
          <Segmented
            label="Road view"
            value={view}
            onChange={pick}
            options={[
              { v: "road", l: "Bracket" },
              { v: "calendar", l: "Calendar" },
              { v: "pickem", l: "Pick'em" },
            ]}
          />
        </div>

        {view === "road" && <Bracket />}
        {view === "calendar" && <Calendar />}
        {view === "pickem" && <Pickem />}
      </Wrap>
    </>
  );
}
