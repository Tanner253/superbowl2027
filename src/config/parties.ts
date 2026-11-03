import type { Party } from "./candidates";

// Party coins, launched from the dev wallet like the candidates: their fees feed the $PRESIDENT burn
// too. `party` picks the card colour.
export type PartyCoin = { id: string; name: string; ticker: string; party: Party; mint: string };

export const PARTY_COINS: PartyCoin[] = [
  { id: "democrats", name: "Democrats", ticker: "DEMOCRATS", party: "D", mint: "" },
  { id: "republicans", name: "Republicans", ticker: "REPUBLICANS", party: "R", mint: "" },
  { id: "america-party", name: "America Party", ticker: "AMERICA", party: "I", mint: "" },
  { id: "america-first", name: "America First", ticker: "AF", party: "R", mint: "" },
];

export const partyKey = (id: string) => `party:${id}`;
