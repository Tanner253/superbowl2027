"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PARTIES, isAlive } from "@/config/candidates";
import { BALLOT, SITE } from "@/config/site";
import { fmtOdds } from "@/lib/format";
import { useCandidateRows } from "@/lib/market-context";
import { EMPTY_BALLOT, ballotCandidate, cleanBallot, decodeBallot, encodeBallot, scoreBallot, type Ballot as B } from "@/lib/race";
import Avatar from "../Avatar";
import { IconX } from "../icons";
import Seal from "../Seal";
import { Sticker, VotedCelebration } from "./VotedSticker";

const DRAFT_KEY = "p28-ballot-v1";
type Slot = keyof B;
const SLOTS: { key: Slot; label: string }[] = [
  { key: "R", label: "Republican nominee" },
  { key: "D", label: "Democratic nominee" },
  { key: "P", label: "Next President" },
];

// WC's bracket challenge, election-sized: call both nominees and the winner, share it, get scored as it plays out.
export default function Ballot() {
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
    // Celebrate the moment a ballot becomes complete, not when a saved one loads.
    if (!(ballot.R && ballot.D && ballot.P) && b.R && b.D && b.P) setCelebrate(true);
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
  const complete = !!(shown.R && shown.D && shown.P);
  const score = scoreBallot(shown);
  const president = ballotCandidate(shown.P);
  const link = typeof window === "undefined" ? "" : `${window.location.origin}/race/?view=ballot&b=${encodeBallot(shown)}`;
  const tweet = president
    ? `My 2028 call: ${president.name} takes the White House. Make yours on ${SITE.name} $${SITE.ticker}`
    : `Calling the 2028 race on ${SITE.name} $${SITE.ticker}`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-slab text-[clamp(30px,5vw,56px)] uppercase leading-none">Call the race</h2>
          <p className="mt-2 max-w-xl text-cream/75">Pick both nominees and the next president. Share your ballot and watch it score as the race plays out.</p>
        </div>
        {shared && (
          <button type="button" onClick={makeOwn} className="border-2 border-cream px-4 py-2 font-narrow font-bold uppercase tracking-[0.14em] hover:bg-cream hover:text-ink">
            Make your own →
          </button>
        )}
      </div>

      <div className="mb-5 border-[3px] border-gold bg-ink px-4 py-3 font-narrow font-bold uppercase tracking-[0.14em]">
        {BALLOT.prize ? (
          <>
            <span className="text-gold">
              {BALLOT.prize.winners} winners × {BALLOT.prize.solEach} SOL
            </span>
            <span className="ml-2 text-cream/80">{BALLOT.prize.rules}</span>
          </>
        ) : (
          <span className="text-cream/80">Giveaways for the best ballots are announced on our socials.</span>
        )}
      </div>

      {shared && (
        <div className="mb-4 bg-gold px-4 py-2 font-narrow text-sm font-bold uppercase tracking-[0.16em] text-ink">Shared ballot · read only</div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {SLOTS.map((s) => {
          const c = ballotCandidate(shown[s.key]);
          const truth = score.truth[s.key];
          const verdict = truth && c ? (truth === c.id ? "right" : "wrong") : null;
          return (
            <button
              key={s.key}
              type="button"
              disabled={!!shared}
              onClick={() => setPicking(s.key)}
              className={`relative flex min-h-[200px] flex-col items-center justify-center gap-3 border-[3px] p-4 text-center transition ${
                s.key === "P" ? "border-gold bg-ink shadow-brutal-gold" : "border-cream bg-ink-2 shadow-brutal-md"
              } ${shared ? "cursor-default" : "hover:-translate-x-1 hover:-translate-y-1"}`}
            >
              <span className="font-narrow text-xs font-bold uppercase tracking-[0.24em] text-gold">{s.label}</span>
              {c ? (
                <>
                  <Avatar c={c} size={76} />
                  <span className="font-slab text-xl uppercase leading-tight">{c.name}</span>
                </>
              ) : (
                <>
                  {s.key === "P" ? <Seal size={64} /> : <span className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-[3px] border-dashed border-cream/40 font-slab text-3xl text-cream/50">?</span>}
                  <span className="font-narrow font-bold uppercase tracking-[0.16em] text-cream/60">{shared ? "No pick" : "Tap to pick"}</span>
                </>
              )}
              {verdict && (
                <span className={`absolute right-2 top-2 px-2 py-0.5 font-narrow text-xs font-bold uppercase ${verdict === "right" ? "bg-lime text-ink" : "bg-red-hot text-cream"}`}>
                  {verdict === "right" ? "✓ Called it" : "✗ Missed"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="border-[3px] border-cream/30 bg-ink-2 px-4 py-3">
          <div className="font-narrow text-xs font-bold uppercase tracking-[0.24em] text-cream/60">Ballot vs reality</div>
          <div className="font-slab text-xl uppercase">
            {score.decided ? `${score.right}/${score.decided} calls right so far` : "Nothing decided yet"}
          </div>
          <p className="mt-1 text-sm text-cream/60">Calls are scored only once the race decides them: nominees at the conventions, the winner on Nov 7, 2028.</p>
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
              className="border-[3px] border-ink bg-gold px-4 py-3 font-narrow font-bold uppercase tracking-[0.14em] text-ink shadow-brutal-sm"
            >
              <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(link)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border-[3px] border-ink bg-cream px-4 py-3 font-narrow font-bold uppercase tracking-[0.14em] text-ink shadow-brutal-sm"
            >
              <IconX /> Share on X
            </a>
            <NativeShare text={tweet} url={link} />
          </div>
        )}
      </div>

      {complete && president && !shared && (
        <div className="mt-8 flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:text-left">
          <Sticker size={96} className="shrink-0 -rotate-6 drop-shadow-[4px_5px_0_rgba(0,0,0,0.45)]" />
          <p className="font-slab text-[clamp(24px,4vw,40px)] uppercase leading-tight">
            <span className="text-gold">{president.name}</span> takes the White House
          </p>
        </div>
      )}

      {celebrate && <VotedCelebration onDone={endCelebration} />}

      {picking && <Picker slot={picking} ballot={ballot} onClose={() => setPicking(null)} onPick={(id) => update({ ...ballot, [picking]: id })} />}
    </div>
  );
}

function NativeShare({ text, url }: { text: string; url: string }) {
  const [can, setCan] = useState(false);
  useEffect(() => setCan(typeof navigator.share === "function"), []);
  if (!can) return null;
  return (
    <button
      type="button"
      onClick={() => navigator.share({ text, url }).catch(() => {})}
      className="border-[3px] border-ink bg-cream px-4 py-3 font-narrow font-bold uppercase tracking-[0.14em] text-ink shadow-brutal-sm"
    >
      Share…
    </button>
  );
}

function Picker({ slot, ballot, onClose, onPick }: { slot: Slot; ballot: B; onClose: () => void; onPick: (id: string) => void }) {
  const rows = useCandidateRows();
  const panel = useRef<HTMLDivElement>(null);
  const finalists = new Set([ballot.R, ballot.D].filter(Boolean));
  const options = rows
    .filter((r) => (slot === "P" ? finalists.has(r.id) || r.party === "I" : r.party === slot))
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
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/80 p-3 sm:items-center" onClick={onClose}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={`Pick the ${title}`}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-[560px] flex-col border-[3px] border-cream bg-ink-2 shadow-brutal-gold"
      >
        <div className="flex items-center justify-between border-b-[3px] border-cream/20 px-4 py-3">
          <span className="font-slab text-xl uppercase">Pick the {title}</span>
          <button type="button" onClick={onClose} aria-label="Close" className="px-2 py-1 font-slab text-xl text-cream/70 hover:text-cream">
            ✕
          </button>
        </div>
        {slot === "P" && finalists.size < 2 && (
          <p className="border-b-2 border-cream/10 px-4 py-2 text-sm text-gold">Pick both nominees first to choose between them (or back an independent).</p>
        )}
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
                className={`flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-cream/10 disabled:cursor-not-allowed disabled:opacity-40 ${
                  ballot[slot] === r.id ? "bg-gold/15 outline outline-2 outline-gold" : ""
                }`}
              >
                <Avatar c={r} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold uppercase">{r.name}</span>
                  <span className="font-narrow text-xs font-bold uppercase tracking-[0.14em] text-cream/60">
                    {PARTIES[r.party].short} · ${r.ticker}
                    {!isAlive(r) && " · Out"}
                  </span>
                </span>
                <span className="font-mono text-sm text-gold">{fmtOdds(r.odds)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
