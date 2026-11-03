import type { Metadata } from "next";
import { share } from "@/lib/og";
import RaceView from "@/components/RaceView";

const description = "The road to the White House: who's still in, the race calendar, and your ballot for the 2028 nominees and president.";

export const metadata: Metadata = {
  title: "The Race",
  description,
  ...share("The Race | US President 2028", description),
};

export default function RacePage() {
  return <RaceView />;
}
