"use client";

import PageHero from "@/components/PageHero";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <PageHero variant="afc" kicker="Something broke" title="Fumble." subtitle="This page hit an error. Run the play again.">
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-md bg-amber px-6 py-3 font-narrow text-lg font-bold uppercase tracking-[0.14em] text-ink shadow-glow hover:-translate-y-0.5"
      >
        Retry
      </button>
    </PageHero>
  );
}
