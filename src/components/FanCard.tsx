"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SITE, VOTER_CARD } from "@/config/site";
import {
  BADGES,
  BADGE_COUNT,
  TIERS,
  badgeLine,
  badgeLit,
  isSolanaAddress,
  tierOf,
  type RosterEntry,
  type RosterMeta,
  type RosterPage,
} from "@/config/voters";
import { fmtNum, shortAddr } from "@/lib/format";
import { DEMO } from "@/lib/market";
import PageHero from "./PageHero";
import SectionTitle from "./SectionTitle";
import { Wrap } from "./ui";
import BadgeIcon from "./fans/BadgeIcon";
import { demoRoster, demoWallet, findOwner, remoteRoster, type RosterSource } from "./fans/roster";

type Status = "loading" | "ready" | "closed" | "error";
type Lookup = { state: "idle" | "searching" | "found" | "missing" | "invalid" | "error"; owner?: string };

export default function FanCard() {
  const source = useMemo<RosterSource | null>(
    () => (DEMO ? demoRoster() : VOTER_CARD.enabled ? remoteRoster(VOTER_CARD.rosterUrl) : null),
    [],
  );
  const [status, setStatus] = useState<Status>(source ? "loading" : "closed");
  const [meta, setMeta] = useState<RosterMeta | null>(null);
  const [pageNo, setPageNo] = useState(1);
  const [page, setPage] = useState<RosterPage | null>(null);
  const [paging, setPaging] = useState(false);
  const [query, setQuery] = useState("");
  const [lookup, setLookup] = useState<Lookup>({ state: "idle" });

  useEffect(() => {
    if (!source) return;
    source
      .meta()
      .then((m) => {
        setMeta(m);
        setStatus(m ? "ready" : "closed");
      })
      .catch(() => setStatus("error"));
  }, [source]);

  const load = useCallback(
    async (n: number) => {
      if (!source) return;
      setPaging(true);
      try {
        setPage(await source.page(n));
        setPageNo(n);
      } catch {
        setStatus("error");
      } finally {
        setPaging(false);
      }
    },
    [source],
  );

  useEffect(() => {
    if (status === "ready") load(1);
  }, [status, load]);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (!isSolanaAddress(q)) return setLookup({ state: "invalid" });
    if (!source || !meta) return setLookup({ state: "missing", owner: q });
    setLookup({ state: "searching" });
    try {
      const hit = await findOwner(source, meta, q);
      if (!hit) return setLookup({ state: "missing", owner: q });
      await load(hit.page);
      setLookup({ state: "found", owner: q });
      requestAnimationFrame(() => document.getElementById(`voter-${q}`)?.scrollIntoView({ block: "center", behavior: "smooth" }));
    } catch {
      setLookup({ state: "error" });
    }
  }

  return (
    <>
      <PageHero
        variant="turf"
        kicker="Earlier and steadier ranks higher"
        title="2027 Fan Card"
        subtitle="Every wallet holding the season gets a spot on the roster. Your tier can fall until the final whistle."
      >
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            ["Fans", meta ? fmtNum(meta.totalEntries) : status === "closed" ? "Soon" : "—"],
            ["Badges", String(BADGE_COUNT)],
            ["Tiers", String(TIERS.length)],
          ].map(([k, v]) => (
            <span key={k} className="rounded-md border border-chalk/15 bg-ink/80 px-3 py-1.5 font-narrow text-sm font-bold uppercase tracking-[0.14em]">
              <span className="text-chalk/60">{k}</span> <span className="text-amber">{v}</span>
            </span>
          ))}
        </div>
      </PageHero>

      <Wrap className="pt-10">
        {status === "closed" ? (
          <div className="rounded-xl border border-dashed border-amber/60 bg-night-2 px-6 py-10 text-center">
            <div className="font-display text-[clamp(30px,4vw,48px)] uppercase leading-none tracking-[0.02em]">The roster opens when ${SITE.ticker} launches</div>
            <p className="mx-auto mt-3 max-w-xl text-chalk/70">
              Hold ${SITE.ticker} or any team coin to make the roster. Ranks update with every fee cycle and freeze at the final whistle.
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="voter-search" className="sr-only">
                Look up a wallet
              </label>
              <input
                id="voter-search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setLookup({ state: "idle" });
                }}
                placeholder="paste any solana address"
                spellCheck={false}
                autoComplete="off"
                className="min-w-0 flex-1 rounded-md border border-amber/60 bg-ink px-4 py-3 font-mono text-sm text-chalk caret-amber shadow-panel outline-none placeholder:text-chalk/35 focus:border-amber"
              />
              <button
                type="submit"
                disabled={status !== "ready" || lookup.state === "searching"}
                className="rounded-md bg-amber px-6 py-3 font-narrow text-lg font-bold uppercase tracking-[0.14em] text-ink shadow-glow-sm disabled:opacity-60"
              >
                {lookup.state === "searching" ? "Checking…" : "Find my card"}
              </button>
            </form>
            {DEMO && meta && (
              <button type="button" onClick={() => setQuery(demoWallet())} className="mt-2 font-narrow text-sm font-bold uppercase tracking-[0.14em] text-amber underline-offset-2 hover:underline">
                Try a demo wallet
              </button>
            )}
            <div aria-live="polite" className="mt-3 min-h-[1.5rem] font-narrow font-bold uppercase tracking-[0.14em]">
              {lookup.state === "invalid" && <span className="text-red-hot">That isn&apos;t a Solana address.</span>}
              {lookup.state === "missing" && <span className="text-red-hot">Not on the roster · this address isn&apos;t on the 2027 Fan Card.</span>}
              {lookup.state === "error" && <span className="text-red-hot">Lookup failed. Try again.</span>}
              {lookup.state === "found" && <span className="text-amber">Found it · page {pageNo}</span>}
            </div>

            {status === "error" ? (
              <div className="mt-4 rounded-lg border border-red-hot bg-night-2 px-4 py-6 text-center font-narrow font-bold uppercase tracking-[0.16em] text-chalk/80">
                The roster didn&apos;t load. Refresh to try again.
              </div>
            ) : (
              <Board page={page} meta={meta} pageNo={pageNo} paging={paging} focus={lookup.state === "found" ? lookup.owner : undefined} onPage={load} />
            )}
          </>
        )}
      </Wrap>

      <Wrap className="pt-16">
        <SectionTitle kicker="How it works" title="Tiers & badges" />
        <ol className="grid gap-3 sm:grid-cols-5">
          {TIERS.map((t, i) => (
            <li key={t.key} className={`rounded-lg border p-3 ${i === TIERS.length - 1 ? "border-amber bg-amber text-ink shadow-glow" : "border-chalk/15 bg-night-2"}`}>
              <div className="font-narrow text-[11px] font-bold uppercase tracking-[0.22em] opacity-70">Tier {i + 1}</div>
              <div className="font-display text-2xl uppercase tracking-[0.02em]">{t.label}</div>
              <p className="mt-1 text-sm opacity-80">{t.blurb}</p>
            </li>
          ))}
        </ol>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BADGES.map((b) => (
            <li key={b.key} className="flex items-center gap-3 rounded-lg border border-chalk/15 bg-night-2 p-3">
              <BadgeIcon k={b.key} lit={b.kind !== "mystery"} size={34} />
              <span>
                <span className="block font-display text-lg uppercase tracking-[0.02em]">{b.label}</span>
                <span className="block text-sm text-chalk/70">
                  {b.how}
                  {"resolvesAt" in b ? ` · ${b.resolvesAt}` : ""}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Wrap>
    </>
  );
}

function Board({
  page,
  meta,
  pageNo,
  paging,
  focus,
  onPage,
}: {
  page: RosterPage | null;
  meta: RosterMeta | null;
  pageNo: number;
  paging: boolean;
  focus?: string;
  onPage: (n: number) => void;
}) {
  const pages = meta?.pageCount ?? 1;
  const grid = "grid grid-cols-[2.5rem_minmax(0,1fr)_86px] items-center gap-3 md:grid-cols-[3.5rem_minmax(0,1fr)_96px_96px_auto]";
  return (
    <div className="panel mt-2 overflow-hidden rounded-xl">
      <div className={`${grid} border-b border-amber/40 bg-ink px-3 py-2.5 font-narrow text-[10px] font-bold uppercase tracking-[0.24em] text-chalk/60`}>
        <span className="text-right">#</span>
        <span>Wallet</span>
        <span>Tier</span>
        <span className="hidden md:block">Rating</span>
        <span className="hidden md:block">Badges</span>
      </div>
      <div className={paging ? "opacity-50 transition-opacity" : "transition-opacity"}>
        {!page
          ? Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={`${grid} px-3 py-3`}>
                <span className="skeleton h-4" />
                <span className="skeleton h-4" />
                <span className="skeleton h-4" />
              </div>
            ))
          : page.entries.map((e) => <Row key={e.owner} e={e} resolved={page.resolvedResultBadges} grid={grid} focused={e.owner === focus} />)}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-chalk/10 px-3 py-3">
        <PageButton disabled={paging || pageNo <= 1} onClick={() => onPage(pageNo - 1)}>
          ← Prev
        </PageButton>
        <span className="font-narrow text-sm font-bold uppercase tracking-[0.18em] text-chalk/70">
          Page {pageNo} / {pages}
        </span>
        <PageButton disabled={paging || pageNo >= pages} onClick={() => onPage(pageNo + 1)}>
          Next →
        </PageButton>
      </div>
    </div>
  );
}

function Row({ e, resolved, grid, focused }: { e: RosterEntry; resolved: readonly string[]; grid: string; focused: boolean }) {
  const tier = tierOf(e.band);
  const earned = BADGES.filter((b) => badgeLit(b, e, resolved));
  return (
    <div
      id={`voter-${e.owner}`}
      className={`${grid} border-b border-chalk/5 px-3 py-2.5 odd:bg-chalk/[0.03] ${focused ? "bg-amber/10 shadow-[inset_4px_0_0_var(--color-amber)]" : ""}`}
    >
      <span className={`text-right font-mono tabular-nums ${e.rank <= 3 || focused ? "text-[15px] text-amber" : "text-[13px] text-chalk/60"}`}>{e.rank}</span>
      <span className="min-w-0">
        <a
          href={`https://solscan.io/account/${e.owner}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`block truncate font-mono text-sm hover:text-amber ${focused ? "text-amber" : ""}`}
        >
          <span className="lg:hidden">{shortAddr(e.owner)}</span>
          <span className="hidden lg:inline">{e.owner}</span>
        </a>
        {earned.length > 0 && (
          <span className="mt-1 flex gap-1 md:hidden">
            {earned.map((b) => (
              <span key={b.key} role="img" aria-label={b.label} title={b.label}>
                <BadgeIcon k={b.key} lit size={16} />
              </span>
            ))}
          </span>
        )}
      </span>
      <span className={`inline-block w-fit font-narrow text-[13px] font-bold uppercase tracking-[0.12em] ${tier?.pill ?? ""}`}>{tier?.label ?? e.band}</span>
      <span className="hidden items-center gap-1 font-narrow text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/50 md:flex">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-amber)" strokeWidth="2.5" aria-hidden="true">
          <rect x="5" y="11" width="14" height="10" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
        Sealed
      </span>
      <span className="hidden gap-1 md:flex">
        {BADGES.map((b) => {
          const line = badgeLine(b, e, resolved);
          return (
            <span key={b.key} tabIndex={0} role="img" aria-label={`${b.label}: ${line}`} className="group relative outline-none">
              <BadgeIcon k={b.key} lit={badgeLit(b, e, resolved)} size={22} />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-max max-w-[220px] -translate-x-1/2 rounded-md border border-amber bg-ink px-2 py-1 text-left group-hover:block group-focus:block">
                <span className="block font-narrow text-xs font-bold uppercase tracking-[0.14em] text-amber">{b.label}</span>
                <span className="block text-xs text-chalk/80">{line}</span>
              </span>
            </span>
          );
        })}
      </span>
    </div>
  );
}

function PageButton({ disabled, onClick, children }: { disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="min-h-[40px] rounded-md border border-chalk/20 px-3 py-1.5 font-narrow text-sm font-bold uppercase tracking-[0.14em] transition hover:border-amber hover:text-amber disabled:opacity-40 disabled:hover:border-chalk/20 disabled:hover:text-chalk"
    >
      {children}
    </button>
  );
}
