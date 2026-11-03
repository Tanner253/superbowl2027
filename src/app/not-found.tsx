import Link from "next/link";
import PageHero from "@/components/PageHero";

export default function NotFound() {
  return (
    <PageHero variant="red" kicker="Error 404" title="This candidate dropped out." subtitle="Recount requested: page not found.">
      <Link
        href="/"
        className="mt-8 inline-block border-[3px] border-ink bg-gold px-6 py-3 font-narrow text-lg font-bold uppercase tracking-[0.14em] text-ink shadow-brutal-md hover:-translate-x-0.5 hover:-translate-y-0.5"
      >
        Back to the race →
      </Link>
    </PageHero>
  );
}
