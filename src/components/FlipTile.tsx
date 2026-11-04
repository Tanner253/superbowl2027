// LED scoreboard digit tile. Keyed by value so each change replays the flip. The unit sits on its
// own plate under the LED panel, so the dot screen never covers it.
export default function FlipTile({ value, unit, size = "md" }: { value: string; unit: string; size?: "md" | "lg" }) {
  return (
    <div className="relative min-w-0 flex-1 overflow-hidden rounded-md border border-amber/30 bg-ink shadow-[inset_0_0_24px_rgba(0,0,0,0.8)]">
      <div className="led relative">
        <div
          key={value}
          className={`led-text animate-flip-in px-1 pb-1.5 pt-2 text-center font-display leading-none tabular-nums ${
            size === "lg" ? "text-[clamp(36px,6vw,66px)]" : "text-[clamp(24px,4vw,40px)]"
          }`}
        >
          {value}
        </div>
        <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-black/60" />
      </div>
      <div className="border-t border-amber/20 bg-night-2 py-1.5 text-center font-narrow text-[12px] font-bold uppercase leading-none tracking-[0.16em] text-chalk sm:text-[14px]">
        {unit}
      </div>
    </div>
  );
}
