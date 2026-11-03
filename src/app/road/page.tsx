import type { Metadata } from "next";
import { share } from "@/lib/og";
import RoadView from "@/components/RoadView";

const description = "The road to Super Bowl LXI: who's still alive, the playoff calendar, and your Pick'em for both conference champions and the winner.";

export const metadata: Metadata = {
  title: "The Road",
  description,
  ...share("The Road | Super Bowl 2027", description),
};

export default function RoadPage() {
  return <RoadView />;
}
