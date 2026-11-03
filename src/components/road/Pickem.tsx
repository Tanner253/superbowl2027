"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CONFERENCES, isAlive } from "@/config/candidates";
import { BALLOT, SITE } from "@/config/site";
import { fmtOdds } from "@/lib/format";
import { useTeamRows } from "@/lib/market-context";
import { EMPTY_BALLOT, ballotTeam, cleanBallot, decodeBallot, encodeBallot, scoreBallot, type Ballot as B } from "@/lib/race";
import Badge from "../Badge";
import { IconX } from "../icons";
import TeamBadge from "../TeamBadge";
import { PicksCelebration, Stub } from "./TicketStub";

const DRAFT_KEY = "sb27-pickem-v1";
type Slot = keyof B;
const SLOTS: { key: Slot; label: string }[] = [
  { key: "A", label: "AFC champion" },
  { key: "N", label: "NFC champion" },
  { key: "W", label: "Super Bowl winner" },
];

// Pick'em: call both conference champions and the winner, share it, get scored as it plays out.
export default function Pickem() {
  const [ballot, setBallot] = useState<B>(EMPTY_BALLOT);
  const [shared, setShared] = useState<B | null>(null);
  const [picking, setPicking] = useState<Slot | null>(null);
  const [copied, setCopied] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const endCelebration = useCallback(() => setCelebrate(false), []);

  useEffect(() => {
    setShared(decodeBallot(new URLSearchParams(window.location.search).get("b")));
    try {
      setBallot(cleanBallot(JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null")));
    } catch {}
  }, []);

  const update = (next: B) => {
    const b = cleanBallot(next);
    // Celebrate the moment the picks become complete, not when saved ones load.
    if (!(ballot.A && ballot.N && ballot.W) && b.A && b.N && b.W) setCelebrate(true);
    setBallot(b);
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(b));
    } catch {}
  };

  const makeOwn = () => {
    setShared(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("b");
    history.replaceState(null, "", url);
  };

  const shown = shared ?? ballot;
  const complete = !!(shown.A && shown.N && shown.W);
  const score = scoreBallot(shown);
  const champ = ballotTeam(shown.W);
  const link = typeof window === "undefined" ? "" : `${window.location.origin}/road/?view=pickem&b=${encodeBallot(shown)}`;
  const tweet = champ ? `My call: the ${champ.name} win it all. Make yours on ${SITE.name} $${SITE.ticker}` : `Making my playoff picks on ${SITE.name} $${SITE.ticker}`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flood-text font-display text-[clamp(34px,5vw,62px)] uppercase leading-none">Pick&apos;em</h2>
          <p className="mt-2 max-w-xl text-chalk/75">Call the AFC champion, the NFC champion and the Super Bowl winner. Share your picks and watch them score as the playoffs play out.</p>
        </div>
        {shared && (
          <button type="button" onClick={makeOwn} className="rounded-md border border-chalk px-4 py-2 font-narrow font-bold uppercase tracking-[0.14em] hover:bg-chalk hover:text-ink">
            Make your own →
          </button>
        )}
      </div>

      <div className="mb-5 rounded-md border border-amber/50 bg-ink px-4 py-3 font-narrow font-bold uppercase tracking-[0.14em]">
        {BALLOT.prize ? (
          <>
            <span className="text-amber">
              {BALLOT.prize.winners} winners × {BALLOT.prize.solEach} SOL
            </span>
            <span className="ml-2 text-chalk/80">{BALLOT.prize.rules}</span>
          </>
        ) : (
          <span className="text-chalk/80">Giveaways for the best picks are announced on our socials.</span>
        )}
      </div>

      {shared && <div className="mb-4 rounded-sm bg-amber px-4 py-2 font-narrow text-sm font-bold uppercase tracking-[0.16em] text-ink">Shared picks · read only</div>}

      <div className="grid gap-4 md:grid-cols-3">
        {SLOTS.map((s) => {
          const c = ballotTeam(shown[s.key]);
          const truth = score.truth[s.key];
          const verdict = truth && c ? (truth === c.id ? "right" : "wrong") : null;
          return (
            <button
              key={s.key}
              type="button"
              disabled={!!shared}
              onClick={() => setPicking(s.key)}
              className={`relative flex min-h-[210px] flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border p-4 text-center transition ${
                s.key === "W" ? "border-amber bg-ink shadow-glow" : "panel"
              } ${shared ? "cursor-default" : "hover:-translate-y-1"}`}
              style={c ? { background: `linear-gradient(160deg, ${c.color}, var(--color-ink) 75%)` } : undefined}
            >
              <span className="font-narrow text-xs font-bold uppercase tracking-[0.24em] text-amber">{s.label}</span>
              {c ? (
                <>
                  <TeamBadge c={c} size={80} />
                  <span className="font-display text-2xl uppercase leading-tight tracking-[0.02em]">{c.name}</span>
                </>
              ) : (
                <>
                  {s.key === "W" ? (
                    <Badge size={70} />
                  ) : (
                    <span className="flex h-[80px] w-[80px] items-center justify-center rounded-full border-2 border-dashed border-chalk/40 font-display text-3xl text-chalk/50">?</span>
                  )}
                  <span className="font-narrow font-bold uppercase tracking-[0.16em] text-chalk/60">{shared ? "No pick" : "Tap to pick"}</span>
                </>
              )}
              {verdict && (
                <span className={`absolute right-2 top-2 rounded-sm px-2 py-0.5 font-narrow text-xs font-bold uppercase ${verdict === "right" ? "bg-lime text-ink" : "bg-red-hot text-chalk"}`}>
                  {verdict === "right" ? "✓ Called it" : "✗ Missed"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="rounded-lg border border-chalk/15 bg-night-2 px-4 py-3">
          <div className="font-narrow text-xs font-bold uppercase tracking-[0.24em] text-chalk/60">Picks vs reality</div>
          <div className="font-display text-2xl uppercase tracking-[0.02em]">{score.decided ? `${score.right}/${score.decided} calls right so far` : "Nothing decided yet"}</div>
          <p className="mt-1 text-sm text-chalk/60">Calls are scored only once the season decides them: the conference champions on Jan 31, the winner on Feb 14, 2027.</p>
        </div>
        {complete && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(link);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                } catch {}
              }}
              className="rounded-md bg-amber px-4 py-3 font-narrow font-bold uppercase tracking-[0.14em] text-ink shadow-glow-sm"
            >
              <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(link)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md bg-chalk px-4 py-3 font-narrow font-bold uppercase tracking-[0.14em] text-ink"
            >
              <IconX /> Share on X
            </a>
            <NativeShare text={tweet} url={link} />
          </div>
        )}
      </div>

      {complete && champ && !shared && (
        <div className="mt-8 flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:text-left">
          <Stub size={180} className="shrink-0 -rotate-6 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
          <p className="font-display text-[clamp(28px,4vw,44px)] uppercase leading-tight tracking-[0.02em]">
            The <span className="text-amber">{champ.name}</span> win it all
          </p>
        </div>
      )}

      {celebrate && <PicksCelebration onDone={endCelebration} />}

      {picking && <Picker slot={picking} ballot={ballot} onClose={() => setPicking(null)} onPick={(id) => update({ ...ballot, [picking]: id })} />}
    </div>
  );
}

function NativeShare({ text, url }: { text: string; url: string }) {
  const [can, setCan] = useState(false);
  useEffect(() => setCan(typeof navigator.share === "function"), []);
  if (!can) return null;
  return (
    <button type="button" onClick={() => navigator.share({ text, url }).catch(() => {})} className="rounded-md bg-chalk px-4 py-3 font-narrow font-bold uppercase tracking-[0.14em] text-ink">
      Share…
    </button>
  );
}

function Picker({ slot, ballot, onClose, onPick }: { slot: Slot; ballot: B; onClose: () => void; onPick: (id: string) => void }) {
  const rows = useTeamRows();
  const panel = useRef<HTMLDivElement>(null);
  const finalists = new Set([ballot.A, ballot.N].filter(Boolean));
  const options = rows
    .filter((r) => (slot === "W" ? finalists.has(r.id) : r.conference === (slot === "A" ? "AFC" : "NFC")))
    .sort((a, b) => Number(isAlive(b)) - Number(isAlive(a)) || (b.odds ?? -1) - (a.odds ?? -1));

  useEffect(() => {
    panel.current?.querySelector<HTMLButtonElement>("button:not([disabled])")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [onClose]);

  const title = SLOTS.find((s) => s.key === slot)!.label;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/80 p-3 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={`Pick the ${title}`}
        onClick={(e) => e.stopPropagation()}
        className="panel flex max-h-[85vh] w-full max-w-[560px] flex-col overflow-hidden rounded-xl"
      >
        <div className="flex items-center justify-between border-b border-chalk/10 px-4 py-3">
          <span className="font-display text-2xl uppercase tracking-[0.02em]">Pick the {title}</span>
          <button type="button" onClick={onClose} aria-label="Close" className="px-2 py-1 font-display text-xl text-chalk/70 hover:text-chalk">
            ✕
          </button>
        </div>
        {slot === "W" && finalists.size < 2 && <p className="border-b border-chalk/10 px-4 py-2 text-sm text-amber">Pick both conference champions first, then choose between them.</p>}
        <ul className="overflow-y-auto p-2">
          {options.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                disabled={!isAlive(r)}
                onClick={() => {
                  onPick(r.id);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition hover:bg-chalk/10 disabled:cursor-not-allowed disabled:opacity-40 ${
                  ballot[slot] === r.id ? "bg-amber/15 outline outline-2 outline-amber" : ""
                }`}
              >
                <TeamBadge c={r} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold uppercase">{r.name}</span>
                  <span className="font-narrow text-xs font-bold uppercase tracking-[0.14em]" style={{ color: CONFERENCES[r.conference].text }}>
                    {r.conference} · ${r.ticker}
                    {!isAlive(r) && " · Out"}
                  </span>
                </span>
                <span className="led-text font-mono text-sm">{fmtOdds(r.odds)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
