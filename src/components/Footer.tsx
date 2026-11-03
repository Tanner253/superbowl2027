import Link from "next/link";
import { SITE } from "@/config/site";
import { SOCIAL_ICONS } from "./icons";
import { Wrap } from "./ui";

export default function Footer() {
  const socials = SITE.socials.filter((s) => s.href);
  return (
    <footer className="border-t border-amber/40 bg-ink">
      <div aria-hidden="true" className="hashmarks h-2 w-full opacity-30" />
      <Wrap className="space-y-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-8 text-sm text-chalk/60">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="font-display text-xl uppercase tracking-[0.02em] text-chalk">
            ${SITE.ticker} <span className="text-amber">·</span> {SITE.name}
          </div>
          {socials.length > 0 && (
            <div className="flex gap-4 text-2xl text-chalk">
              {socials.map((s) => {
                const Icon = SOCIAL_ICONS[s.label];
                return (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="hover:text-amber">
                    {Icon ? <Icon /> : s.label}
                  </a>
                );
              })}
            </div>
          )}
        </div>
        <p className="max-w-4xl">
          {SITE.name} (${SITE.ticker}) is an independent memecoin project. It is not affiliated with, endorsed by, or
          associated with the NFL, any team, any player, or Polymarket. Team and event names are used only to identify
          what the coins are about. Memecoins are highly speculative and can go to zero; nothing here is financial
          advice. Odds are live prices from{" "}
          <a href={SITE.polymarketEvent} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-amber">
            Polymarket
          </a>
          , not predictions by this site.
        </p>
        <Link href="/credits/" className="inline-block font-narrow font-bold uppercase tracking-[0.16em] text-chalk/80 hover:text-amber">
          Data &amp; credits →
        </Link>
      </Wrap>
    </footer>
  );
}
