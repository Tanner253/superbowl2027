"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/config/site";
import Badge from "./Badge";
import BuyButton from "./BuyButton";
import { useGame } from "./game/GameProvider";
import { IconBallot, IconCoin, IconFlag, IconFootball, IconHome, IconUsers, SOCIAL_ICONS } from "./icons";

export const LINKS = [
  { href: "/", label: "Home", short: "Home", Icon: IconHome },
  { href: "/superbowl/", label: `$${SITE.ticker}`, short: `$${SITE.ticker}`, Icon: IconCoin },
  { href: "/teams/", label: "Teams", short: "Teams", Icon: IconUsers },
  { href: "/road/", label: "The Road", short: "Road", Icon: IconFlag },
  { href: "/fans/", label: "Fan Card", short: "Fans", Icon: IconBallot },
];

const norm = (p: string) => p.replace(/\/+$/, "") || "/";

// Opens the kick-return game. It floats over the page and stays open across navigation.
function PlayButton({ compact = false }: { compact?: boolean }) {
  const { view, toggle } = useGame();
  const open = view === "open";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={open}
      aria-label={compact ? "Play Kick Return" : undefined}
      className={`flex items-center gap-2 rounded-md border px-3 py-2 font-narrow text-[14px] font-bold uppercase tracking-[0.14em] transition ${
        open ? "border-amber bg-amber text-ink shadow-glow-sm" : "border-amber/50 text-amber hover:bg-amber hover:text-ink"
      }`}
    >
      <IconFootball className="text-[18px]" />
      {!compact && <span>Kick Return</span>}
    </button>
  );
}

export default function Nav() {
  const path = norm(usePathname() ?? "/");
  const socials = SITE.socials.filter((s) => s.href);
  return (
    <>
      <header className="sticky top-0 z-40 h-[68px] border-b border-amber/40 bg-ink/90 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Badge size={46} className="drop-shadow-[0_0_12px_rgba(255,194,61,0.35)]" />
            <span className="font-display text-[19px] uppercase leading-[0.95] tracking-[0.02em] sm:text-[21px]">
              Super Bowl
              <br />
              <span className="text-amber">2027</span>
            </span>
          </Link>
          <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => {
              const active = path === norm(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative whitespace-nowrap px-3 py-2 font-narrow text-[15px] font-bold uppercase tracking-[0.12em] transition ${
                    active ? "text-amber" : "text-chalk/75 hover:text-chalk"
                  }`}
                >
                  {l.label}
                  {active && <span aria-hidden="true" className="absolute inset-x-3 -bottom-[13px] h-[3px] bg-amber shadow-[0_0_12px_var(--color-amber)]" />}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3 lg:ml-2">
            {socials.map((s) => {
              const Icon = SOCIAL_ICONS[s.label];
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-xl text-chalk/80 hover:bg-chalk/10 hover:text-amber"
                >
                  {Icon ? <Icon /> : s.label}
                </a>
              );
            })}
            <div className="hidden sm:block">
              <PlayButton />
            </div>
            <div className="sm:hidden">
              <PlayButton compact />
            </div>
            <div className="hidden xl:block">
              <BuyButton size="sm" />
            </div>
          </div>
        </div>
      </header>

      <nav aria-label="Sections" className="sticky top-[68px] z-30 grid grid-cols-5 border-b border-amber/40 bg-ink/95 backdrop-blur-md lg:hidden">
        {LINKS.map((l) => {
          const active = path === norm(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-[52px] flex-col items-center justify-center gap-1 px-1 font-narrow text-[11px] font-bold uppercase tracking-[0.06em] ${
                active ? "text-amber" : "text-chalk/70"
              }`}
            >
              <l.Icon className="text-[19px]" />
              <span className="max-w-full truncate">{l.short}</span>
              {active && <span aria-hidden="true" className="absolute inset-x-3 bottom-0 h-[3px] bg-amber" />}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
