"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE } from "@/config/site";
import { fmtOdds, fmtUsdShort } from "@/lib/format";
import { useCandidateRows, usePartyOdds, type CandidateRow } from "@/lib/market-context";
import Avatar from "../Avatar";
import SectionTitle from "../SectionTitle";
import { Wrap } from "../ui";

// One decimal so the two sides never visibly add up to 101%.
const pct1 = (p: number) => `${(p * 100).toFixed(1)}%`;

// Electoral-map style tug of war: who's winning the White House, by party.
export default function RaceTo270() {
  const party = usePartyOdds();
  const rows = useCandidateRows();
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 80);
    return () => clearTimeout(t);
  }, []);

  const cap = (p: "R" | "D" | "I") => rows.filter((r) => r.party === p && r.market).reduce((a, r) => a + r.market!.marketCap, 0);
  const caps = { R: cap("R"), D: cap("D"), I: cap("I") };
  const capTotal = caps.R + caps.D + caps.I;
  const front = (p: "R" | "D") => [...rows].filter((r) => r.party === p).sort((a, b) => (b.odds ?? -1) - (a.odds ?? -1))[0];

  const oddsKnown = party.R !== null && party.D !== null;
  const lead = !oddsKnown ? null : party.R! > party.D! ? "R" : party.D! > party.R! ? "D" : null;

  return (
    <section className="py-14 sm:py-20">
      <Wrap>
        <SectionTitle
          kicker="Who's winning the White House"
          title="Race to 270"
          aside={
            <a href={SITE.partyEvent} target="_blank" rel="noopener noreferrer" className="font-narrow font-bold uppercase tracking-[0.16em] text-gold hover:text-cream">
              Party odds on Polymarket ↗
            </a>
          }
        />

        <div className="border-[3px] border-cream bg-ink-2 p-4 shadow-brutal-gold sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <PartyEnd side="R" label="Republicans" value={oddsKnown ? pct1(party.R!) : "—"} lead={lead === "R"} />
            <PartyEnd side="D" label="Democrats" value={oddsKnown ? pct1(party.D!) : "—"} lead={lead === "D"} />
          </div>

          <Bar
            label="Polymarket · chance to win the presidency"
            r={drawn && oddsKnown ? party.R! : 0}
            d={drawn && oddsKnown ? party.D! : 0}
            marker
          />

          <Bar
            label="The coin vote · candidate market cap by party"
            r={drawn && capTotal ? caps.R / capTotal : 0}
            d={drawn && capTotal ? caps.D / capTotal : 0}
            empty={capTotal ? undefined : "Polls open when the candidate coins launch"}
            rightNote={capTotal ? `${fmtUsdShort(caps.R)} vs ${fmtUsdShort(caps.D)}` : undefined}
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Frontrunner r={front("R")} side="R" />
            <Frontrunner r={front("D")} side="D" />
          </div>
        </div>
      </Wrap>
    </section>
  );
}

function PartyEnd({ side, label, value, lead }: { side: "R" | "D"; label: string; value: string; lead: boolean }) {
  const color = side === "R" ? "text-red-hot" : "text-sky";
  return (
    <div className={side === "D" ? "text-right" : ""}>
      <div className={`flex items-center gap-2 font-narrow text-sm font-bold uppercase tracking-[0.2em] ${color} ${side === "D" ? "justify-end" : ""}`}>
        {label}
        {lead && <span className="bg-gold px-1.5 py-0.5 text-[11px] tracking-[0.14em] text-ink">Leads</span>}
      </div>
      <div className={`font-slab text-[clamp(40px,7vw,76px)] leading-none tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function Bar({
  label,
  r,
  d,
  empty,
  rightNote,
  marker = false,
}: {
  label: string;
  r: number;
  d: number;
  empty?: string;
  rightNote?: string;
  marker?: boolean;
}) {
  return (
    <div className={marker ? "mb-8 mt-5" : "mt-5"}>
      <div className="mb-1.5 flex justify-between gap-3 font-narrow text-[11px] font-bold uppercase tracking-[0.2em] text-cream/60">
        <span>{label}</span>
        {rightNote && <span className="tabular-nums">{rightNote}</span>}
      </div>
      <div className="relative h-9 border-[3px] border-ink bg-ink-3">
        {empty ? (
          <div className="flex h-full items-center justify-center border-2 border-dashed border-cream/20 font-narrow text-xs font-bold uppercase tracking-[0.18em] text-cream/55">
            {empty}
          </div>
        ) : (
          <>
            <div className="absolute inset-y-0 left-0 bg-red transition-[width] duration-1000 ease-out" style={{ width: `${r * 100}%` }} />
            <div className="absolute inset-y-0 right-0 bg-blue transition-[width] duration-1000 ease-out" style={{ width: `${d * 100}%` }} />
          </>
        )}
        <div aria-hidden="true" className="absolute inset-y-[-8px] left-1/2 w-[3px] -translate-x-1/2 bg-gold" />
        {marker && (
          <span className="absolute -bottom-[30px] left-1/2 -translate-x-1/2 whitespace-nowrap bg-gold px-1.5 py-0.5 font-narrow text-[10px] font-bold uppercase tracking-[0.16em] text-ink">
            ★ 270 to win ★
          </span>
        )}
      </div>
    </div>
  );
}

function Frontrunner({ r, side }: { r?: CandidateRow; side: "R" | "D" }) {
  if (!r) return null;
  return (
    <Link
      href={`/candidates/#${r.id}`}
      className={`flex items-center gap-3 border-[3px] border-ink bg-ink px-3 py-2 transition hover:-translate-y-0.5 ${side === "D" ? "sm:flex-row-reverse sm:text-right" : ""}`}
    >
      <Avatar c={r} size={44} />
      <span className="min-w-0 flex-1">
        <span className={`block font-narrow text-[11px] font-bold uppercase tracking-[0.2em] ${side === "R" ? "text-red-hot" : "text-sky"}`}>
          {side === "R" ? "GOP" : "DEM"} frontrunner
        </span>
        <span className="block truncate font-bold uppercase">{r.name}</span>
      </span>
      <span className="font-slab text-xl tabular-nums text-gold">{fmtOdds(r.odds)}</span>
    </Link>
  );
}
