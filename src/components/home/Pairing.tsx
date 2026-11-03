import { PAIRING } from "@/config/site";
import SectionTitle from "../SectionTitle";
import { Pylon, Wrap } from "../ui";

export default function Pairing() {
  return (
    <section className="turf relative border-y border-amber/30 py-14 sm:py-20">
      <div aria-hidden="true" className="yardlines absolute inset-0" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-ink/60" />
      <Wrap className="relative">
        <SectionTitle kicker="Why it works" title={PAIRING.title} />
        <p className="-mt-2 mb-8 max-w-2xl text-lg text-chalk/85">{PAIRING.intro}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PAIRING.points.map((p, i) => (
            <div
              key={p.title}
              className={`relative overflow-hidden rounded-lg border p-5 ${
                i === 0 ? "border-amber bg-amber text-ink shadow-glow sm:col-span-2" : "border-chalk/15 bg-ink/80 shadow-panel backdrop-blur-sm"
              }`}
            >
              <Pylon color={i === 0 ? "var(--color-ink)" : "var(--color-amber)"} />
              <div className={`font-display text-sm ${i === 0 ? "text-ink/70" : "text-amber"}`}>{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-1 font-display text-2xl uppercase tracking-[0.02em]">{p.title}</h3>
              <p className={`mt-2 ${i === 0 ? "text-ink/85" : "text-chalk/85"}`}>{p.body}</p>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}
