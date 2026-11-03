// LED scoreboard digit tile. Keyed by value so each change replays the flip.
export default function FlipTile({ value, unit, size = "md" }: { value: string; unit: string; size?: "md" | "lg" }) {
  return (
    <div className="led relative min-w-0 flex-1 overflow-hidden rounded-md border border-amber/30 bg-ink shadow-[inset_0_0_24px_rgba(0,0,0,0.8)]">
      <div
        key={value}
        className={`led-text animate-flip-in px-1 pt-1.5 text-center font-display leading-none tabular-nums ${
          size === "lg" ? "text-[clamp(36px,6vw,66px)]" : "text-[clamp(24px,4vw,40px)]"
        }`}
      >
        {value}
      </div>
      <div className="pb-1.5 text-center font-narrow text-[10px] font-bold uppercase tracking-[0.22em] text-chalk/60">{unit}</div>
      <span aria-hidden="true" className="absolute inset-x-0 top-[44%] h-px bg-black/60" />
    </div>
  );
}
