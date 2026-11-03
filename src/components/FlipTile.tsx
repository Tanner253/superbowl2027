// Scoreboard digit tile. Keyed by value so each change replays the flip animation.
export default function FlipTile({ value, unit, size = "md" }: { value: string; unit: string; size?: "md" | "lg" }) {
  return (
    <div className="relative min-w-0 flex-1 border-[3px] border-ink bg-cream text-ink shadow-brutal-sm">
      <div
        key={value}
        className={`animate-flip-in px-1 pt-1 text-center font-slab leading-none tabular-nums ${
          size === "lg" ? "text-[clamp(34px,6vw,64px)]" : "text-[clamp(24px,4vw,40px)]"
        }`}
      >
        {value}
      </div>
      <div className="pb-1 text-center font-narrow text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">{unit}</div>
      <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-ink/15" />
    </div>
  );
}
