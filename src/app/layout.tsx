import type { Metadata, Viewport } from "next";
import { Anton, Barlow_Condensed, Inter, JetBrains_Mono } from "next/font/google";
import BurnCelebration from "@/components/BurnCelebration";
import Footer from "@/components/Footer";
import { GameProvider } from "@/components/game/GameProvider";
import Nav from "@/components/Nav";
import Splash from "@/components/Splash";
import { SITE } from "@/config/site";
import { DEMO } from "@/lib/market";
import { MarketProvider } from "@/lib/market-context";
import { share } from "@/lib/og";
import { ENTERED_SCRIPT } from "@/lib/splash";
import "./globals.css";

const display = Anton({ weight: "400", subsets: ["latin"], variable: "--ff-display" });
const narrow = Barlow_Condensed({ weight: ["500", "600", "700"], subsets: ["latin"], variable: "--ff-narrow" });
const inter = Inter({ subsets: ["latin"], variable: "--ff-inter" });
const mono = JetBrains_Mono({ weight: ["500", "700"], subsets: ["latin"], variable: "--ff-mono" });

const description = `The 2026 season on-chain. One memecoin per title contender, all feeding $${SITE.ticker} on the road to ${SITE.gameName}. Exclusively on pump.fun.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} | $${SITE.ticker}`, template: `%s | ${SITE.name}` },
  description,
  ...share(`${SITE.name} | $${SITE.ticker}`, description),
};

export const viewport: Viewport = { themeColor: "#04080f", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ENTERED_SCRIPT }} />
      </head>
      <body className={`${display.variable} ${narrow.variable} ${inter.variable} ${mono.variable} font-sans antialiased`}>
        <MarketProvider>
          <GameProvider>
            {DEMO && (
              <div className="bg-amber px-4 py-1.5 text-center font-narrow text-sm font-bold uppercase tracking-[0.16em] text-ink">
                Preview mode · demo numbers, not real market data
              </div>
            )}
            <Nav />
            <main className="pb-16">{children}</main>
            <Footer />
            <BurnCelebration />
            <Splash />
          </GameProvider>
        </MarketProvider>
      </body>
    </html>
  );
}
