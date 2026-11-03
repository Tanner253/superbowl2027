import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { Wrap } from "@/components/ui";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "Data & credits" };

const ROWS: { what: string; who: string; href?: string }[] = [
  { what: "Title odds and conference odds", who: "Polymarket, “Pro Football: 2027 Champion” market", href: SITE.polymarketEvent },
  { what: "Coin prices, market caps and volume", who: "DexScreener public API, with Jupiter for coins quoted in $SUPERBOWL", href: "https://dexscreener.com" },
  { what: "Burned total", who: "Read straight from the Solana chain", href: "https://solscan.io" },
  { what: "Fee-engine totals and holder counts", who: "Published by the project's crank after every cycle" },
  { what: "Fonts", who: "Anton, Barlow Condensed, Inter and JetBrains Mono, under the SIL Open Font License", href: "https://fonts.google.com" },
  { what: "Team cards, badges, the field-goal background and the kick-return game", who: "Drawn and written for this site; no team or league artwork is used" },
];

export default function CreditsPage() {
  return (
    <>
      <PageHero
        title="Data & credits"
        subtitle={`Where every live number on ${SITE.name} comes from. Team names identify the teams the coins are about; this site is not affiliated with the NFL, any team or any player.`}
      />
      <Wrap className="pt-12">
        <ul className="panel divide-y divide-chalk/10 overflow-hidden rounded-xl">
          {ROWS.map((r) => (
            <li key={r.what} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 text-sm">
              <span className="font-bold">{r.what}</span>
              <span className="text-chalk/70">
                {r.href ? (
                  <a href={r.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-amber">
                    {r.who}
                  </a>
                ) : (
                  r.who
                )}
              </span>
            </li>
          ))}
        </ul>
      </Wrap>
    </>
  );
}
