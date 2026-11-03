import type { Party } from "./candidates";

export const STAGES = [
  { id: "field", label: "The Field", short: "Field", when: "2026–27", blurb: "Names test the waters and declare." },
  { id: "debates", label: "Debates", short: "Debates", when: "2027", blurb: "Primary debates thin the field." },
  { id: "early", label: "Early States", short: "Early", when: "Jan–Feb 2028", blurb: "The first caucuses and primaries." },
  { id: "super", label: "Super Tuesday", short: "Super Tue", when: "Mar 7, 2028", blurb: "The biggest single day of the primaries." },
  { id: "primaries", label: "Primaries", short: "Primaries", when: "Mar–Jun 2028", blurb: "The delegate race to the nomination." },
  { id: "conventions", label: "Conventions", short: "Conventions", when: "Summer 2028", blurb: "Each party crowns its nominee." },
  { id: "general", label: "Election Day", short: "Nov 7", when: "Nov 7, 2028", blurb: "Nominee vs nominee. One winner." },
] as const;

export type StageId = (typeof STAGES)[number]["id"];

// Move this forward as the race progresses.
export const CURRENT_STAGE: StageId = "field";

export const stageIndex = (id: StageId) => STAGES.findIndex((s) => s.id === id);
export const stageLabel = (id: StageId) => STAGES[stageIndex(id)].label;

// The race calendar (WC's fixtures). Add dates as they're announced and fill in
// `result` once an event is decided. Events without a date show as "TBD".
export type RaceEvent = {
  id: string;
  title: string;
  stage: StageId;
  // ISO date (YYYY-MM-DD) or null when not announced yet.
  date: string | null;
  // Shown when date is null, e.g. "Early 2028".
  when?: string;
  place: string;
  party?: Party;
  // e.g. "Vance wins", "Called · Newsom". Presence marks the event as decided.
  result?: string;
};

export const EVENTS: RaceEvent[] = [
  { id: "midterms-2026", title: "Midterm elections", stage: "field", date: "2026-11-03", place: "Nationwide" },
  { id: "gop-debates", title: "First Republican primary debate", stage: "debates", date: null, when: "2027", place: "TBD", party: "R" },
  { id: "dem-debates", title: "First Democratic primary debate", stage: "debates", date: null, when: "2027", place: "TBD", party: "D" },
  { id: "first-contests", title: "First caucuses & primaries", stage: "early", date: null, when: "Early 2028", place: "Early states" },
  { id: "super-tuesday", title: "Super Tuesday", stage: "super", date: "2028-03-07", place: "Multi-state primaries" },
  { id: "rnc", title: "Republican National Convention", stage: "conventions", date: null, when: "Summer 2028", place: "TBD", party: "R" },
  { id: "dnc", title: "Democratic National Convention", stage: "conventions", date: null, when: "Summer 2028", place: "TBD", party: "D" },
  { id: "election-day", title: "Election Day", stage: "general", date: "2028-11-07", place: "Nationwide" },
  { id: "inauguration", title: "Inauguration Day", stage: "general", date: "2029-01-20", place: "Washington, D.C." },
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
