const isNum = (n: number | null | undefined): n is number => typeof n === "number" && Number.isFinite(n);

// $64.48K, $1.23M, $0.0000645
export function fmtUsd(n: number | null | undefined) {
  if (!isNum(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  if (abs >= 1) return `$${n.toFixed(2)}`;
  if (abs === 0) return "$0";
  return `$${n.toFixed(Math.min(12, 2 - Math.floor(Math.log10(abs))))}`;
}

// Short form for tight spots: $64K, $1.2M
export function fmtUsdShort(n: number | null | undefined) {
  if (!isNum(n)) return "—";
  if (Math.abs(n) < 1) return fmtUsd(n);
  return `$${Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)}`;
}

export function fmtPct(n: number | null | undefined, signed = true) {
  if (!isNum(n)) return "—";
  const s = `${Math.abs(n).toFixed(2)}%`;
  if (!signed) return s;
  return n > 0 ? `+${s}` : n < 0 ? `-${s}` : s;
}

// ▲ 6.12% / ▼ 3.10%
export function fmtDir(n: number | null | undefined) {
  if (!isNum(n)) return "—";
  return `${n > 0 ? "▲" : n < 0 ? "▼" : "•"} ${Math.abs(n).toFixed(2)}%`;
}

// Win probability 0–1 → "20%", "9.6%", "0.7%"
export function fmtOdds(p: number | null | undefined) {
  if (!isNum(p)) return "—";
  const pct = p * 100;
  return pct < 1 ? `${pct.toFixed(1)}%` : `${pct.toFixed(pct < 10 ? 1 : 0)}%`;
}

// Probability change 0–1 scale → "▲ 2.1 pts"
export function fmtOddsDelta(d: number | null | undefined) {
  if (!isNum(d)) return "—";
  const pts = d * 100;
  return `${pts > 0 ? "▲" : pts < 0 ? "▼" : "•"} ${Math.abs(pts).toFixed(1)} pts`;
}

export function fmtNum(n: number | null | undefined) {
  if (!isNum(n)) return "—";
  return Math.round(n).toLocaleString("en-US");
}

// 48.22M, 9.9K
export function fmtCompact(n: number | null | undefined) {
  if (!isNum(n)) return "—";
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n);
}

export function fmtSol(n: number | null | undefined) {
  if (!isNum(n)) return "—";
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} SOL`;
}

// 2heJ…LDog
export const shortAddr = (a: string) => (a.length > 12 ? `${a.slice(0, 4)}…${a.slice(-4)}` : a);

// "just now", "12 min ago", "3 h ago", "2 d ago"
export function timeAgo(iso: string | null | undefined, now: number) {
  if (!iso) return "—";
  const s = Math.max(0, (now - Date.parse(iso)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

// "Nov 7", "Mar 7, 2028"
export function fmtDate(iso: string, withYear = false) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
}

export const changeColor = (n: number | null | undefined) =>
  !isNum(n) || n === 0 ? "text-cream/60" : n > 0 ? "text-lime" : "text-red-hot";
