import type { Metadata } from "next";
import { share } from "@/lib/og";
import CandidatesView from "@/components/CandidatesView";

const description = "Every 2028 candidate coin, ranked: market cap, 24h moves, volume and live Polymarket win odds.";

export const metadata: Metadata = {
  title: "The Candidates",
  description,
  ...share("The Candidates | US President 2028", description),
};

export default function CandidatesPage() {
  return <CandidatesView />;
}
