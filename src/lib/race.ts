import { CANDIDATES, isAlive, type Candidate, type Party } from "@/config/candidates";
import { CURRENT_STAGE, stageIndex, type StageId } from "@/config/race";

// The road to the White House as bracket columns (WC's knockout rounds).
// Each column covers one or more race stages.
export const ROAD = [
  { id: "field", label: "The Field", short: "Field", stages: ["field", "debates"] },
  { id: "early", label: "Early States", short: "Early", stages: ["early"] },
  { id: "super", label: "Super Tuesday", short: "Super Tue", stages: ["super", "primaries"] },
  { id: "nominee", label: "Nominee", short: "Nominee", stages: ["conventions"] },
] as const satisfies readonly { id: string; label: string; short: string; stages: readonly StageId[] }[];

export type RoadId = (typeof ROAD)[number]["id"];

const columnOf = (stage: StageId) => ROAD.findIndex((col) => (col.stages as readonly StageId[]).includes(stage));

// Index of the furthest road column the race itself has reached (election day = past the last column).
export const currentColumn = () => (CURRENT_STAGE === "general" ? ROAD.length : columnOf(CURRENT_STAGE));

// Furthest column a candidate reached. Nominees and the winner made it all the way.
export function reachedColumn(c: Candidate) {
  if (c.status === "nominee" || c.status === "winner") return ROAD.length - 1;
  if (c.status === "out") return c.outAt ? Math.max(0, columnOf(c.outAt)) : 0;
  return Math.min(currentColumn(), ROAD.length - 2);
}

export const nomineeOf = (party: Party) =>
  CANDIDATES.find((c) => c.party === party && (c.status === "nominee" || c.status === "winner"));
export const winner = () => CANDIDATES.find((c) => c.status === "winner");

// Higher = lasted longer. Used to order lists (winner, nominees, still in, then by how late they dropped out).
export function survival(c: Candidate) {
  if (c.status === "winner") return 100;
  if (c.status === "nominee") return 90;
  if (isAlive(c)) return 80;
  return c.outAt ? stageIndex(c.outAt) : 0;
}

// ---- "Call the race" ballot

export type Ballot = { R: string | null; D: string | null; P: string | null };
export const EMPTY_BALLOT: Ballot = { R: null, D: null, P: null };

const byId = (id: string | null) => (id ? CANDIDATES.find((c) => c.id === id) : undefined);
export const ballotCandidate = byId;

// Drop picks that no longer make sense (unknown ids, wrong party, president not among the finalists).
export function cleanBallot(b: Partial<Ballot> | null | undefined): Ballot {
  const R = byId(b?.R ?? null)?.party === "R" ? b!.R! : null;
  const D = byId(b?.D ?? null)?.party === "D" ? b!.D! : null;
  const p = byId(b?.P ?? null);
  const P = p && (p.id === R || p.id === D || p.party === "I") ? p.id : null;
  return { R, D, P };
}

// Share code: candidate ids joined by "." (empty slot = "-"), e.g. "vance.newsom.vance".
export const encodeBallot = (b: Ballot) => [b.R, b.D, b.P].map((x) => x ?? "-").join(".");
export function decodeBallot(code: string | null): Ballot | null {
  if (!code) return null;
  const [R, D, P] = code.split(".").map((x) => (x && x !== "-" ? x : null));
  const b = cleanBallot({ R, D, P });
  return b.R || b.D || b.P ? b : null;
}

// Picks scored only where reality has decided: right / decided.
export function scoreBallot(b: Ballot) {
  const truth: Ballot = { R: nomineeOf("R")?.id ?? null, D: nomineeOf("D")?.id ?? null, P: winner()?.id ?? null };
  const slots = (["R", "D", "P"] as const).filter((k) => truth[k]);
  return {
    truth,
    decided: slots.length,
    right: slots.filter((k) => b[k] === truth[k]).length,
  };
}
