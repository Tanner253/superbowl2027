"use client";

import PageHero from "@/components/PageHero";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <PageHero variant="red" kicker="Something broke" title="Too close to call." subtitle="This page hit an error. Try it again.">
      <button
        type="button"
        onClick={reset}
        className="mt-8 border-[3px] border-ink bg-gold px-6 py-3 font-narrow text-lg font-bold uppercase tracking-[0.14em] text-ink shadow-brutal-md hover:-translate-x-0.5 hover:-translate-y-0.5"
      >
        Retry
      </button>
    </PageHero>
  );
}
