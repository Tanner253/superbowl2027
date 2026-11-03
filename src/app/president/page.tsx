import type { Metadata } from "next";
import { share } from "@/lib/og";
import MainToken from "@/components/MainToken";
import { SITE } from "@/config/site";

const description = `Track the live $${SITE.ticker} burn count, market cap and fee engine.`;

export const metadata: Metadata = {
  title: `$${SITE.ticker}`,
  description,
  ...share(`$${SITE.ticker} | ${SITE.name}`, description),
};

export default function PresidentPage() {
  return <MainToken />;
}
