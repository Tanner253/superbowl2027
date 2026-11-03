import type { Metadata } from "next";
import { share } from "@/lib/og";
import FanCard from "@/components/FanCard";

const description = "The 2027 Fan Card: every wallet on the roster, ranked. Earlier and steadier ranks higher.";

export const metadata: Metadata = {
  title: "Fan Card",
  description,
  ...share("2027 Fan Card | Super Bowl 2027", description),
};

export default function FansPage() {
  return <FanCard />;
}
