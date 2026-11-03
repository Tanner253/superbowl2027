import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { Wrap } from "@/components/ui";
import { CANDIDATES } from "@/config/candidates";
import { PHOTOS } from "@/config/photos";

export const metadata: Metadata = { title: "Photo credits" };

export default function CreditsPage() {
  const rows = CANDIDATES.flatMap((c) => (PHOTOS[c.id] ? [{ c, p: PHOTOS[c.id] }] : []));
  return (
    <>
      <PageHero
        title="Photo credits"
        subtitle="Candidate photos come from Wikimedia Commons and are shown cropped. Their use here doesn't imply any endorsement by the people pictured or the photographers."
      />
      <Wrap className="pt-12">
        <ul className="divide-y-2 divide-cream/10 border-[3px] border-cream bg-ink-2 shadow-brutal-gold">
          {rows.map(({ c, p }) => (
            <li key={c.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 text-sm">
              <span className="font-bold">{c.name}</span>
              <span className="text-cream/70">
                {p.author} ·{" "}
                {p.licenseUrl ? (
                  <a href={p.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gold">
                    {p.license}
                  </a>
                ) : (
                  p.license
                )}{" "}
                ·{" "}
                <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gold">
                  Source
                </a>
              </span>
            </li>
          ))}
        </ul>
      </Wrap>
    </>
  );
}
