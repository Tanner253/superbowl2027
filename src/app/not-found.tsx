import Link from "next/link";
import PageHero from "@/components/PageHero";

export default function NotFound() {
  return (
    <PageHero variant="afc" kicker="Error 404" title="Incomplete pass." subtitle="Flag on the play: page not found.">
      <Link
        href="/"
        className="mt-8 inline-block rounded-md bg-amber px-6 py-3 font-narrow text-lg font-bold uppercase tracking-[0.14em] text-ink shadow-glow hover:-translate-y-0.5"
      >
        Back to the field →
      </Link>
    </PageHero>
  );
}
