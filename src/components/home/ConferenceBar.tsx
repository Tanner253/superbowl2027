"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONFERENCES, type Conference } from "@/config/candidates";
import { SITE } from "@/config/site";
import { fmtOdds, fmtUsdShort } from "@/lib/format";
import { useConferenceOdds, useTeamRows, type TeamRow } from "@/lib/market-context";
import SectionTitle from "../SectionTitle";
import TeamBadge from "../TeamBadge";
import { Wrap } from "../ui";

// One decimal so the two sides never visibly add up to 101%.
const pct1 = (p: number) => `${(p * 100).toFixed(1)}%`;

// Tug of war at midfield: which conference the champion comes from.
export default function ConferenceBar() {
  const conf = useConferenceOdds();
  const rows = useTeamRows();
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 80);
    return () => clearTimeout(t);
  }, []);

  const cap = (c: Conference) => rows.filter((r) => r.conference === c && r.market).reduce((a, r) => a + r.market!.marketCap, 0);
  const caps = { AFC: cap("AFC"), NFC: cap("NFC") };
  const capTotal = caps.AFC + caps.NFC;
  const front = (c: Conference) => [...rows].filter((r) => r.conference === c).sort((a, b) => (b.odds ?? -1) - (a.odds ?? -1))[0];

  const oddsKnown = conf.AFC !== null && conf.NFC !== null;
  const lead = !oddsKnown ? null : conf.AFC! > conf.NFC! ? "AFC" : conf.NFC! > conf.AFC! ? "NFC" : null;

  return (
    <section className="py-14 sm:py-20">
      <Wrap>
        <SectionTitle
          kicker="Where the title is headed"
          title="AFC vs NFC"
          aside={
            <a href={SITE.polymarketEvent} target="_blank" rel="noopener noreferrer" className="font-narrow font-bold uppercase tracking-[0.16em] text-amber hover:text-chalk">
              Title odds on Polymarket ↗
            </a>
          }
        />

        <div className="panel rounded-xl p-4 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <ConferenceEnd side="AFC" value={oddsKnown ? pct1(conf.AFC!) : "—"} lead={lead === "AFC"} />
            <ConferenceEnd side="NFC" value={oddsKnown ? pct1(conf.NFC!) : "—"} lead={lead === "NFC"} />
          </div>

          <Bar label="Polymarket · chance the champion comes from each conference" a={drawn && oddsKnown ? conf.AFC! : 0} n={drawn && oddsKnown ? conf.NFC! : 0} marker />

          <Bar
            label="The coin vote · team market cap by conference"
            a={drawn && capTotal ? caps.AFC / capTotal : 0}
            n={drawn && capTotal ? caps.NFC / capTotal : 0}
            empty={capTotal ? undefined : "Kickoff when the team coins launch"}
            rightNote={capTotal ? `${fmtUsdShort(caps.AFC)} vs ${fmtUsdShort(caps.NFC)}` : undefined}
          />

          <p className="mt-4 font-narrow text-xs font-bold uppercase tracking-[0.16em] text-chalk/50">
            Summed title odds of all 32 teams, 16 per conference, from Polymarket
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Favorite r={front("AFC")} side="AFC" />
            <Favorite r={front("NFC")} side="NFC" />
          </div>
        </div>
      </Wrap>
    </section>
  );
}

function ConferenceEnd({ side, value, lead }: { side: Conference; value: string; lead: boolean }) {
  const color = side === "AFC" ? "text-afc-hot" : "text-nfc-hot";
  return (
    <div className={side === "NFC" ? "text-right" : ""}>
      <div className={`flex items-center gap-2 font-narrow text-sm font-bold uppercase tracking-[0.2em] ${color} ${side === "NFC" ? "justify-end" : ""}`}>
        {side}
        {lead && <span className="rounded-sm bg-amber px-1.5 py-0.5 text-[11px] tracking-[0.14em] text-ink">Leads</span>}
      </div>
      <div className={`font-display text-[clamp(44px,7vw,80px)] leading-none tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function Bar({ label, a, n, empty, rightNote, marker = false }: { label: string; a: number; n: number; empty?: string; rightNote?: string; marker?: boolean }) {
  return (
    <div className={marker ? "mb-8 mt-5" : "mt-5"}>
      <div className="mb-1.5 flex justify-between gap-3 font-narrow text-[11px] font-bold uppercase tracking-[0.2em] text-chalk/60">
        <span>{label}</span>
        {rightNote && <span className="tabular-nums">{rightNote}</span>}
      </div>
      <div className="turf relative h-10 overflow-hidden rounded-md border border-chalk/20">
        <div aria-hidden="true" className="yardlines absolute inset-0 opacity-70" />
        {empty ? (
          <div className="relative flex h-full items-center justify-center font-narrow text-xs font-bold uppercase tracking-[0.18em] text-chalk/70">{empty}</div>
        ) : (
          <>
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-afc to-afc-hot transition-[width] duration-1000 ease-out" style={{ width: `${a * 100}%` }} />
            <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-nfc to-nfc-hot transition-[width] duration-1000 ease-out" style={{ width: `${n * 100}%` }} />
          </>
        )}
        <div aria-hidden="true" className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-chalk shadow-[0_0_10px_var(--color-chalk)]" />
      </div>
      {marker && (
        <div className="relative">
          <span className="absolute left-1/2 top-1.5 -translate-x-1/2 whitespace-nowrap rounded-sm bg-chalk px-1.5 py-0.5 font-narrow text-[10px] font-bold uppercase tracking-[0.16em] text-ink">
            ◆ Midfield ◆
          </span>
        </div>
      )}
    </div>
  );
}

function Favorite({ r, side }: { r?: TeamRow; side: Conference }) {
  if (!r) return null;
  return (
    <Link
      href={`/teams/#${r.id}`}
      className={`flex items-center gap-3 rounded-md border border-chalk/10 bg-ink px-3 py-2 transition hover:-translate-y-0.5 hover:border-amber/50 ${side === "NFC" ? "sm:flex-row-reverse sm:text-right" : ""}`}
    >
      <TeamBadge c={r} size={44} />
      <span className="min-w-0 flex-1">
        <span className="block font-narrow text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: CONFERENCES[side].text }}>
          {side} favorite
        </span>
        <span className="block truncate font-bold uppercase">{r.name}</span>
      </span>
      <span className="led-text font-display text-2xl tabular-nums">{fmtOdds(r.odds)}</span>
    </Link>
  );
}
