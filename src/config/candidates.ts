import { stageLabel, type StageId } from "./race";

export type Conference = "AFC" | "NFC";

// running: still alive. out: eliminated (set outAt to the round they lost). nominee: conference
// champion. winner: champion.
export type Status = "running" | "out" | "nominee" | "winner";

export type Team = {
  id: string;
  // Full team name, exactly as the coin is named on pump.fun.
  name: string;
  city: string;
  nickname: string;
  // Short scoreboard code, shown on the team badge.
  abbr: string;
  ticker: string;
  conference: Conference;
  // pump.fun contract address; leave "" until the coin is live.
  mint: string;
  status: Status;
  outAt?: StageId;
  // Date they were eliminated (ISO, e.g. "2027-01-17"), shown in the calendar.
  outDate?: string;
  // Market id on Polymarket's "Pro Football: 2027 Champion" event, for live odds.
  polymarketId?: string;
  // Team colors for cards and badges: fill, stripe, and readable text on the fill.
  color: string;
  stripe: string;
  on: string;
};

// color = conference fill; on = readable text color on that fill.
export const CONFERENCES: Record<Conference, { name: string; short: string; color: string; on: string; text: string }> = {
  AFC: { name: "American Football Conference", short: "AFC", color: "var(--color-afc)", on: "var(--color-chalk)", text: "var(--color-afc-hot)" },
  NFC: { name: "National Football Conference", short: "NFC", color: "var(--color-nfc)", on: "var(--color-chalk)", text: "var(--color-nfc-hot)" },
};

const CHALK = "#f4f7f2";
const INK = "#050b14";

// Roster: the 16 teams with the best odds on Polymarket's title market (Nov 3, 2026), ordered by
// those odds, plus the Giants. Add a line here to launch another team later.
export const TEAMS: Team[] = [
  { id: "49ers", name: "San Francisco 49ers", city: "San Francisco", nickname: "49ers", abbr: "SF", ticker: "49ERS", conference: "NFC", mint: "", status: "running", polymarketId: "1357398", color: "#aa0000", stripe: "#b3995d", on: CHALK },
  { id: "bills", name: "Buffalo Bills", city: "Buffalo", nickname: "Bills", abbr: "BUF", ticker: "BILLS", conference: "AFC", mint: "", status: "running", polymarketId: "1357374", color: "#00338d", stripe: "#c60c30", on: CHALK },
  { id: "bears", name: "Chicago Bears", city: "Chicago", nickname: "Bears", abbr: "CHI", ticker: "BEARS", conference: "NFC", mint: "", status: "running", polymarketId: "1357376", color: "#0b162a", stripe: "#c83803", on: CHALK },
  { id: "chiefs", name: "Kansas City Chiefs", city: "Kansas City", nickname: "Chiefs", abbr: "KC", ticker: "CHIEFS", conference: "AFC", mint: "", status: "running", polymarketId: "1357386", color: "#e31837", stripe: "#ffb81c", on: CHALK },
  { id: "jaguars", name: "Jacksonville Jaguars", city: "Jacksonville", nickname: "Jaguars", abbr: "JAX", ticker: "JAGUARS", conference: "AFC", mint: "", status: "running", polymarketId: "1357385", color: "#006778", stripe: "#d7a22a", on: CHALK },
  { id: "rams", name: "Los Angeles Rams", city: "Los Angeles", nickname: "Rams", abbr: "LAR", ticker: "RAMS", conference: "NFC", mint: "", status: "running", polymarketId: "1357389", color: "#003594", stripe: "#ffa300", on: CHALK },
  { id: "seahawks", name: "Seattle Seahawks", city: "Seattle", nickname: "Seahawks", abbr: "SEA", ticker: "SEAHAWKS", conference: "NFC", mint: "", status: "running", polymarketId: "1357399", color: "#002244", stripe: "#69be28", on: CHALK },
  { id: "bengals", name: "Cincinnati Bengals", city: "Cincinnati", nickname: "Bengals", abbr: "CIN", ticker: "BENGALS", conference: "AFC", mint: "", status: "running", polymarketId: "1357377", color: "#fb4f14", stripe: "#101010", on: INK },
  { id: "broncos", name: "Denver Broncos", city: "Denver", nickname: "Broncos", abbr: "DEN", ticker: "BRONCOS", conference: "AFC", mint: "", status: "running", polymarketId: "1357380", color: "#fb4f14", stripe: "#002244", on: INK },
  { id: "lions", name: "Detroit Lions", city: "Detroit", nickname: "Lions", abbr: "DET", ticker: "LIONS", conference: "NFC", mint: "", status: "running", polymarketId: "1357381", color: "#0076b6", stripe: "#b0b7bc", on: CHALK },
  { id: "patriots", name: "New England Patriots", city: "New England", nickname: "Patriots", abbr: "NE", ticker: "PATRIOTS", conference: "AFC", mint: "", status: "running", polymarketId: "1357392", color: "#002244", stripe: "#c60c30", on: CHALK },
  { id: "vikings", name: "Minnesota Vikings", city: "Minnesota", nickname: "Vikings", abbr: "MIN", ticker: "VIKINGS", conference: "NFC", mint: "", status: "running", polymarketId: "1357391", color: "#4f2683", stripe: "#ffc62f", on: CHALK },
  { id: "packers", name: "Green Bay Packers", city: "Green Bay", nickname: "Packers", abbr: "GB", ticker: "PACKERS", conference: "NFC", mint: "", status: "running", polymarketId: "1357382", color: "#203731", stripe: "#ffb612", on: CHALK },
  { id: "steelers", name: "Pittsburgh Steelers", city: "Pittsburgh", nickname: "Steelers", abbr: "PIT", ticker: "STEELERS", conference: "AFC", mint: "", status: "running", polymarketId: "1357397", color: "#101820", stripe: "#ffb612", on: CHALK },
  { id: "cowboys", name: "Dallas Cowboys", city: "Dallas", nickname: "Cowboys", abbr: "DAL", ticker: "COWBOYS", conference: "NFC", mint: "", status: "running", polymarketId: "1357379", color: "#041e42", stripe: "#869397", on: CHALK },
  { id: "texans", name: "Houston Texans", city: "Houston", nickname: "Texans", abbr: "HOU", ticker: "TEXANS", conference: "AFC", mint: "", status: "running", polymarketId: "1357383", color: "#03202f", stripe: "#a71930", on: CHALK },
  // Added after launch: the 17th team, launched from the creator wallet on Nov 4, 2026.
  { id: "giants", name: "New York Giants", city: "New York", nickname: "Giants", abbr: "NYG", ticker: "GIANTS", conference: "NFC", mint: "", status: "running", polymarketId: "1357394", color: "#0b2265", stripe: "#a71930", on: CHALK },
];

// The other 15 teams get no coin, but their odds still count toward the AFC vs NFC bar.
export const OTHER_TEAMS: { name: string; conference: Conference; polymarketId: string }[] = [
  { name: "Atlanta Falcons", conference: "NFC", polymarketId: "1357372" },
  { name: "Tampa Bay Buccaneers", conference: "NFC", polymarketId: "1357400" },
  { name: "Carolina Panthers", conference: "NFC", polymarketId: "1357375" },
  { name: "Baltimore Ravens", conference: "AFC", polymarketId: "1357373" },
  { name: "Washington Commanders", conference: "NFC", polymarketId: "1357402" },
  { name: "Cleveland Browns", conference: "AFC", polymarketId: "1357378" },
  { name: "Philadelphia Eagles", conference: "NFC", polymarketId: "1357396" },
  { name: "New Orleans Saints", conference: "NFC", polymarketId: "1357393" },
  { name: "Las Vegas Raiders", conference: "AFC", polymarketId: "1357387" },
  { name: "Tennessee Titans", conference: "AFC", polymarketId: "1357401" },
  { name: "New York Jets", conference: "AFC", polymarketId: "1357395" },
  { name: "Miami Dolphins", conference: "AFC", polymarketId: "1357390" },
  { name: "Los Angeles Chargers", conference: "AFC", polymarketId: "1357388" },
  { name: "Indianapolis Colts", conference: "AFC", polymarketId: "1357384" },
  { name: "Arizona Cardinals", conference: "NFC", polymarketId: "1357371" },
];

// Still alive in the hunt for the title.
export const isAlive = (t: Team) => t.status !== "out";

export function statusLabel(t: Team) {
  switch (t.status) {
    case "running":
      return "Alive";
    case "out":
      return t.outAt ? `Out · ${stageLabel(t.outAt)}` : "Out";
    case "nominee":
      return `${t.conference} Champion`;
    case "winner":
      return "Champion";
  }
}

// Visual tone for status chips: alive, out, or a crowned result.
export function statusTone(t: Team): "alive" | "out" | "gold" {
  return t.status === "out" ? "out" : t.status === "nominee" || t.status === "winner" ? "gold" : "alive";
}
