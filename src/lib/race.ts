import { TEAMS, isAlive, type Conference, type Team } from "@/config/candidates";
import { CURRENT_STAGE, stageIndex, type StageId } from "@/config/race";

// The road to the Super Bowl as bracket columns, one per round. Each column covers one stage.
export const ROAD = [
  { id: "season", label: "Regular Season", short: "Season", stages: ["season"] },
  { id: "wildcard", label: "Wild Card", short: "Wild Card", stages: ["wildcard"] },
  { id: "divisional", label: "Divisional", short: "Divisional", stages: ["divisional"] },
  { id: "conference", label: "Conference", short: "Conference", stages: ["conference"] },
] as const satisfies readonly { id: string; label: string; short: string; stages: readonly StageId[] }[];

export type RoadId = (typeof ROAD)[number]["id"];

const columnOf = (stage: StageId) => ROAD.findIndex((col) => (col.stages as readonly StageId[]).includes(stage));

// Index of the furthest road column the season itself has reached (Super Bowl = past the last column).
export const currentColumn = () => (CURRENT_STAGE === "superbowl" ? ROAD.length : columnOf(CURRENT_STAGE));

// Furthest column a team reached. Conference champions and the champion made it all the way.
export function reachedColumn(t: Team) {
  if (t.status === "nominee" || t.status === "winner") return ROAD.length - 1;
  if (t.status === "out") return t.outAt ? Math.max(0, Math.min(columnOf(t.outAt), ROAD.length - 1)) : 0;
  return Math.min(currentColumn(), ROAD.length - 2);
}

export const championOf = (conf: Conference) => TEAMS.find((t) => t.conference === conf && (t.status === "nominee" || t.status === "winner"));
export const winner = () => TEAMS.find((t) => t.status === "winner");

// Higher = lasted longer. Used to order lists (champion, conference champions, still alive, then by
// how late they were knocked out).
export function survival(t: Team) {
  if (t.status === "winner") return 100;
  if (t.status === "nominee") return 90;
  if (isAlive(t)) return 80;
  return t.outAt ? stageIndex(t.outAt) : 0;
}

// ---- Pick'em: AFC champion, NFC champion, Super Bowl winner

export type Ballot = { A: string | null; N: string | null; W: string | null };
export const EMPTY_BALLOT: Ballot = { A: null, N: null, W: null };

const byId = (id: string | null) => (id ? TEAMS.find((t) => t.id === id) : undefined);
export const ballotTeam = byId;

// Drop picks that no longer make sense (unknown ids, wrong conference, winner not one of the two).
export function cleanBallot(b: Partial<Ballot> | null | undefined): Ballot {
  const A = byId(b?.A ?? null)?.conference === "AFC" ? b!.A! : null;
  const N = byId(b?.N ?? null)?.conference === "NFC" ? b!.N! : null;
  const w = byId(b?.W ?? null);
  const W = w && (w.id === A || w.id === N) ? w.id : null;
  return { A, N, W };
}

// Share code: team ids joined by "." (empty slot = "-"), e.g. "bills.49ers.bills".
export const encodeBallot = (b: Ballot) => [b.A, b.N, b.W].map((x) => x ?? "-").join(".");
export function decodeBallot(code: string | null): Ballot | null {
  if (!code) return null;
  const [A, N, W] = code.split(".").map((x) => (x && x !== "-" ? x : null));
  const b = cleanBallot({ A, N, W });
  return b.A || b.N || b.W ? b : null;
}

// Picks scored only where the season has decided: right / decided.
export function scoreBallot(b: Ballot) {
  const truth: Ballot = { A: championOf("AFC")?.id ?? null, N: championOf("NFC")?.id ?? null, W: winner()?.id ?? null };
  const slots = (["A", "N", "W"] as const).filter((k) => truth[k]);
  return {
    truth,
    decided: slots.length,
    right: slots.filter((k) => b[k] === truth[k]).length,
  };
}
