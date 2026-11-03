"use client";

import { pad2, splitDuration, useNow } from "@/lib/useNow";

export default function Countdown({ to }: { to: string }) {
  const now = useNow();
  const d = now === null ? null : splitDuration(Date.parse(to) - now);
  const cells = [
    { v: d ? String(d.days) : "—", unit: "Days" },
    { v: d ? pad2(d.hours) : "—", unit: "Hrs" },
    { v: d ? pad2(d.mins) : "—", unit: "Mins" },
    { v: d ? pad2(d.secs) : "—", unit: "Secs" },
  ];
  return (
    <div className="flex gap-2">
      {cells.map((c) => (
        <div key={c.unit} className="min-w-[58px] rounded-md bg-cream px-2 py-1.5 text-center text-ink">
          <div className="font-slab text-2xl leading-none tabular-nums">{c.v}</div>
          <div className="mt-1 font-narrow text-[11px] font-bold uppercase tracking-[0.18em]">{c.unit}</div>
        </div>
      ))}
    </div>
  );
}

// Time until the next claim cycle, or null when the claim process hasn't published a schedule.
// A past nextCycleAt rolls forward by whole intervals.
export function nextCycleTarget(next: string | null | undefined, intervalMs: number, now: number) {
  if (!next) return null;
  const t = Date.parse(next);
  if (Number.isNaN(t)) return null;
  return t > now ? t : t + Math.ceil((now - t) / intervalMs) * intervalMs;
}

export function CycleTimer({ next, intervalMs }: { next: string | null; intervalMs: number }) {
  const now = useNow();
  const target = now === null ? null : nextCycleTarget(next, intervalMs, now);
  if (now === null || target === null) return <span className="tabular-nums">--:--</span>;
  const d = splitDuration(target - now);
  return (
    <span className="tabular-nums">
      {d.hours > 0 ? `${d.hours}:` : ""}
      {pad2(d.mins)}:{pad2(d.secs)}
    </span>
  );
}
