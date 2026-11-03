import type { Metadata } from "next";
import { share } from "@/lib/og";
import TeamsView from "@/components/TeamsView";

const description = "Every team coin, ranked: market cap, 24h moves, volume and live Polymarket title odds.";

export const metadata: Metadata = {
  title: "The Teams",
  description,
  ...share("The Teams | Super Bowl 2027", description),
};

export default function TeamsPage() {
  return <TeamsView />;
}
