import type { Metadata } from "next";
import { share } from "@/lib/og";
import VoterCard from "@/components/VoterCard";

const description = "The 2028 Voter Card: every wallet on the rolls, ranked. Earlier and steadier ranks higher.";

export const metadata: Metadata = {
  title: "Voter Card",
  description,
  ...share("2028 Voter Card | US President 2028", description),
};

export default function VotersPage() {
  return <VoterCard />;
}
