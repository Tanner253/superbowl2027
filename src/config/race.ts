import type { Conference } from "./candidates";

export const STAGES = [
  { id: "season", label: "Regular Season", short: "Season", when: "Through Jan 10", blurb: "Eighteen weeks to earn a playoff seat." },
  { id: "wildcard", label: "Wild Card", short: "Wild Card", when: "Jan 16–18", blurb: "Twelve teams, six games, no second chances." },
  { id: "divisional", label: "Divisional", short: "Divisional", when: "Jan 23–24", blurb: "Eight teams left. The top seeds enter." },
  { id: "conference", label: "Conference Championships", short: "Conference", when: "Jan 31", blurb: "One AFC champion, one NFC champion." },
  { id: "superbowl", label: "Super Bowl", short: "Feb 14", when: "Feb 14, 2027", blurb: "SoFi Stadium, Inglewood. One champion." },
] as const;

export type StageId = (typeof STAGES)[number]["id"];

// Move this forward as the season progresses.
export const CURRENT_STAGE: StageId = "season";

export const stageIndex = (id: StageId) => STAGES.findIndex((s) => s.id === id);
export const stageLabel = (id: StageId) => STAGES[stageIndex(id)].label;

// The season calendar. Add dates as they're announced and fill in `result` once a game is decided.
// Events without a date show as "TBD".
export type RaceEvent = {
  id: string;
  title: string;
  stage: StageId;
  // ISO date (YYYY-MM-DD) or null when not announced yet.
  date: string | null;
  // Shown when date is null, e.g. "Late January".
  when?: string;
  place: string;
  conference?: Conference;
  // e.g. "Bills 27, Chiefs 24". Presence marks the event as decided.
  result?: string;
};

export const EVENTS: RaceEvent[] = [
  { id: "week-18", title: "Week 18: regular season finale", stage: "season", date: "2027-01-10", place: "Every stadium" },
  { id: "wild-card-sat", title: "Wild Card Saturday", stage: "wildcard", date: "2027-01-16", place: "Home of the higher seeds" },
  { id: "wild-card-sun", title: "Wild Card Sunday", stage: "wildcard", date: "2027-01-17", place: "Home of the higher seeds" },
  { id: "wild-card-mon", title: "Wild Card Monday", stage: "wildcard", date: "2027-01-18", place: "Home of the higher seeds" },
  { id: "divisional-sat", title: "Divisional Saturday", stage: "divisional", date: "2027-01-23", place: "Home of the higher seeds" },
  { id: "divisional-sun", title: "Divisional Sunday", stage: "divisional", date: "2027-01-24", place: "Home of the higher seeds" },
  { id: "afc-title", title: "AFC Championship Game", stage: "conference", date: "2027-01-31", place: "Home of the higher seed", conference: "AFC" },
  { id: "nfc-title", title: "NFC Championship Game", stage: "conference", date: "2027-01-31", place: "Home of the higher seed", conference: "NFC" },
  { id: "super-bowl", title: "Super Bowl LXI", stage: "superbowl", date: "2027-02-14", place: "SoFi Stadium, Inglewood, California" },
];

// Events count as upcoming until the end of their day (US Eastern, roughly).
const endOfDay = (date: string) => Date.parse(`${date}T23:59:59-05:00`);

export const upcomingEvents = (now: number) =>
  EVENTS.filter((e) => !e.result && (e.date === null || endOfDay(e.date) >= now)).sort(
    (a, b) => (a.date ? Date.parse(a.date) : Infinity) - (b.date ? Date.parse(b.date) : Infinity),
  );

export const pastEvents = (now: number) =>
  EVENTS.filter((e) => e.result || (e.date !== null && endOfDay(e.date) < now)).sort(
    (a, b) => (b.date ? Date.parse(b.date) : 0) - (a.date ? Date.parse(a.date) : 0),
  );

// Next dated event, for countdowns.
export const nextDatedEvent = (now: number) => upcomingEvents(now).find((e) => e.date);
