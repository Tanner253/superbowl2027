import { PAIRING } from "@/config/site";
import SectionTitle from "../SectionTitle";
import { Notch, Wrap } from "../ui";

export default function Pairing() {
  return (
    <section className="border-y-4 border-gold bg-navy py-14 sm:py-20">
      <Wrap>
        <SectionTitle kicker="Why it works" title={PAIRING.title} />
        <p className="-mt-2 mb-8 max-w-2xl text-lg text-cream/80">{PAIRING.intro}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PAIRING.points.map((p, i) => (
            <div
              key={p.title}
              className={`relative border-[3px] p-5 ${
                i === 0 ? "border-ink bg-red shadow-brutal-gold sm:col-span-2" : "border-cream/80 bg-ink-2 shadow-brutal-md"
              }`}
            >
              <Notch color={i === 0 ? "var(--color-cream)" : "var(--color-gold)"} />
              <div className="font-slab text-sm text-gold">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-1 font-slab text-xl uppercase">{p.title}</h3>
              <p className="mt-2 text-cream/85">{p.body}</p>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}
