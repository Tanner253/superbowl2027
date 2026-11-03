import type { Party } from "./candidates";

// Party coins, launched from the dev wallet like the candidates: their fees feed the $PRESIDENT burn
// too. `party` picks the card colour.
export type PartyCoin = { id: string; name: string; ticker: string; party: Party; mint: string };

export const PARTY_COINS: PartyCoin[] = [
  { id: "democrats", name: "Democrats", ticker: "DEMOCRATS", party: "D", mint: "3N2JZ1rmA4MAKWUBFic7EfRDckgm8nZPzqibPuFjpump" },
  { id: "republicans", name: "Republicans", ticker: "REPUBLICANS", party: "R", mint: "3N86GcdaPMELKvLmv9Wm3Dd3iiyuq6skVrfvJcP1pump" },
  { id: "america-party", name: "America Party", ticker: "AMERICA", party: "I", mint: "3zGxYxyoFVgrEEaJCGwjghUWxCyN99B1CJFJFAmSpump" },
  { id: "america-first", name: "America First", ticker: "AF", party: "R", mint: "3NYh5f3R3Sdr8zqZeQa2E9BBuJpmiudUCCUV9Pewpump" },
];

export const partyKey = (id: string) => `party:${id}`;
