import { stageLabel, type StageId } from "./race";

export type Party = "R" | "D" | "I";

// undeclared: on the board but hasn't announced. out: dropped out (set outAt).
export type Status = "undeclared" | "running" | "out" | "nominee" | "winner";

export type Candidate = {
  id: string;
  name: string;
  ticker: string;
  party: Party;
  // pump.fun contract address; leave "" until the coin is live.
  mint: string;
  status: Status;
  outAt?: StageId;
  // Date they dropped out (ISO, e.g. "2027-09-14"), shown in the race calendar.
  outDate?: string;
  // Market id on Polymarket's "Presidential Election Winner 2028" event, for live odds.
  polymarketId?: string;
  // Optional photo in /public/candidates/. Initials are shown otherwise.
  image?: string;
};

// color = party fill; on = readable text color on that fill; adj = "Democratic nominee".
export const PARTIES: Record<Party, { name: string; plural: string; adj: string; short: string; color: string; on: string }> = {
  R: { name: "Republican", plural: "Republicans", adj: "Republican", short: "GOP", color: "var(--color-red)", on: "var(--color-cream)" },
  D: { name: "Democrat", plural: "Democrats", adj: "Democratic", short: "DEM", color: "var(--color-blue)", on: "var(--color-cream)" },
  I: { name: "Independent", plural: "Independents", adj: "Independent", short: "IND", color: "var(--color-gold)", on: "var(--color-ink)" },
};

// Roster: everyone at 0.5%+ on Polymarket's 2028 winner market (Oct 23, 2026),
// ordered by those odds. Add a line here to launch a new candidate later.
export const CANDIDATES: Candidate[] = [
  { id: "vance", name: "JD Vance", ticker: "VANCE", party: "R", mint: "", status: "undeclared", polymarketId: "561229" },
  { id: "aoc", name: "Alexandria Ocasio-Cortez", ticker: "AOC", party: "D", mint: "", status: "undeclared", polymarketId: "561231" },
  { id: "ossoff", name: "Jon Ossoff", ticker: "OSSOFF", party: "D", mint: "", status: "undeclared", polymarketId: "561261" },
  { id: "newsom", name: "Gavin Newsom", ticker: "NEWSOM", party: "D", mint: "", status: "undeclared", polymarketId: "561230" },
  { id: "rubio", name: "Marco Rubio", ticker: "RUBIO", party: "R", mint: "", status: "undeclared", polymarketId: "561234" },
  { id: "harris", name: "Kamala Harris", ticker: "KAMALA", party: "D", mint: "", status: "undeclared", polymarketId: "561239" },
  { id: "shapiro", name: "Josh Shapiro", ticker: "SHAPIRO", party: "D", mint: "", status: "undeclared", polymarketId: "561233" },
  { id: "buttigieg", name: "Pete Buttigieg", ticker: "PETE", party: "D", mint: "", status: "undeclared", polymarketId: "561232" },
  { id: "desantis", name: "Ron DeSantis", ticker: "DESANTIS", party: "R", mint: "", status: "undeclared", polymarketId: "561246" },
  { id: "beshear", name: "Andy Beshear", ticker: "BESHEAR", party: "D", mint: "", status: "undeclared", polymarketId: "561237" },
  { id: "talarico", name: "James Talarico", ticker: "TALARICO", party: "D", mint: "", status: "undeclared", polymarketId: "561262" },
  { id: "the-rock", name: "Dwayne “The Rock” Johnson", ticker: "ROCK", party: "I", mint: "", status: "undeclared", polymarketId: "561252" },
  { id: "carlson", name: "Tucker Carlson", ticker: "TUCKER", party: "R", mint: "", status: "undeclared", polymarketId: "561253" },
  { id: "trump", name: "Donald Trump", ticker: "TRUMP", party: "R", mint: "", status: "undeclared", polymarketId: "561243" },
  { id: "kelly", name: "Mark Kelly", ticker: "KELLY", party: "D", mint: "", status: "undeclared", polymarketId: "561279" },
  { id: "warnock", name: "Raphael Warnock", ticker: "WARNOCK", party: "D", mint: "", status: "undeclared", polymarketId: "561280" },
  { id: "moore", name: "Wes Moore", ticker: "MOORE", party: "D", mint: "", status: "undeclared", polymarketId: "561235" },
  { id: "massie", name: "Thomas Massie", ticker: "MASSIE", party: "R", mint: "", status: "undeclared", polymarketId: "561260" },
  { id: "khanna", name: "Ro Khanna", ticker: "KHANNA", party: "D", mint: "3P5qPgvJehB84dJxcJWR14kMBteeGG5A4VSfkG2opump", status: "undeclared", polymarketId: "561259" },
  { id: "pritzker", name: "JB Pritzker", ticker: "PRITZKER", party: "D", mint: "", status: "undeclared", polymarketId: "561241" },
  { id: "cruz", name: "Ted Cruz", ticker: "CRUZ", party: "R", mint: "", status: "undeclared", polymarketId: "561281" },
  { id: "ivanka", name: "Ivanka Trump", ticker: "IVANKA", party: "R", mint: "", status: "undeclared", polymarketId: "561255" },
  { id: "emanuel", name: "Rahm Emanuel", ticker: "RAHM", party: "D", mint: "", status: "undeclared", polymarketId: "561282" },
  { id: "trump-jr", name: "Donald Trump Jr.", ticker: "DONJR", party: "R", mint: "", status: "undeclared", polymarketId: "561244" },
  { id: "musk", name: "Elon Musk", ticker: "MUSK", party: "I", mint: "3z87rAr4dr3Ckf9mmEmGsCHiSqV11ovsD28pPf7apump", status: "undeclared", polymarketId: "561250", image: "https://m.rapidlaunch.io/images/rNfoFO5pg.jpg" },
];

// Still in the race (undeclared names count until they rule themselves out).
export const isAlive = (c: Candidate) => c.status !== "out";

export function statusLabel(c: Candidate) {
  switch (c.status) {
    case "undeclared":
      return "Undeclared";
    case "running":
      return "Running";
    case "out":
      return c.outAt ? `Out · ${stageLabel(c.outAt)}` : "Out";
    case "nominee":
      return `${PARTIES[c.party].adj} Nominee`;
    case "winner":
      return "President-Elect";
  }
}

// Visual tone for status chips: alive (still in), out, or a crowned result.
export function statusTone(c: Candidate): "alive" | "out" | "gold" {
  return c.status === "out" ? "out" : c.status === "nominee" || c.status === "winner" ? "gold" : "alive";
}

export function initials(name: string) {
  const parts = name.replace(/[“”"]/g, "").split(/\s+/).filter((p) => /^[A-Za-z]/.test(p) && p !== "Jr.");
  return ((parts[0]?.[0] ?? "") + (parts.at(-1)?.[0] ?? "")).toUpperCase();
}
