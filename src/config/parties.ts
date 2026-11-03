import type { Conference } from "./candidates";

// Conference coins, launched from the creator wallet like the teams: their fees feed the $SUPERBOWL
// burn too. `conference` picks the card colour. Leave `mint` empty: the site fills it in from the
// crank's coin list by ticker (an address typed here still wins).
export type GroupCoin = { id: string; name: string; ticker: string; conference: Conference; mint: string };

export const GROUP_COINS: GroupCoin[] = [
  { id: "afc", name: "AFC", ticker: "AFC", conference: "AFC", mint: "" },
  { id: "nfc", name: "NFC", ticker: "NFC", conference: "NFC", mint: "" },
];

export const groupKey = (id: string) => `group:${id}`;
