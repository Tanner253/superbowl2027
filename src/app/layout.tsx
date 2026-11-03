import type { Metadata, Viewport } from "next";
import { Alfa_Slab_One, Barlow_Condensed, Inter, JetBrains_Mono } from "next/font/google";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Splash from "@/components/Splash";
import { SITE } from "@/config/site";
import { DEMO } from "@/lib/market";
import { MarketProvider } from "@/lib/market-context";
import { share } from "@/lib/og";
import { ENTERED_SCRIPT } from "@/lib/splash";
import "./globals.css";

const slab = Alfa_Slab_One({ weight: "400", subsets: ["latin"], variable: "--ff-slab" });
const narrow = Barlow_Condensed({ weight: ["500", "600", "700"], subsets: ["latin"], variable: "--ff-narrow" });
const inter = Inter({ subsets: ["latin"], variable: "--ff-inter" });
const mono = JetBrains_Mono({ weight: ["500", "700"], subsets: ["latin"], variable: "--ff-mono" });

const description = `Every 2028 candidate on-chain. One memecoin per name in the race, all feeding $${SITE.ticker}. Exclusively on pump.fun.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} | $${SITE.ticker}`, template: `%s | ${SITE.name}` },
  description,
  ...share(`${SITE.name} | $${SITE.ticker}`, description),
};

export const viewport: Viewport = { themeColor: "#060f27", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ENTERED_SCRIPT }} />
      </head>
      <body className={`${slab.variable} ${narrow.variable} ${inter.variable} ${mono.variable} font-sans antialiased`}>
        <MarketProvider>
          {DEMO && (
            <div className="bg-gold px-4 py-1.5 text-center font-narrow text-sm font-bold uppercase tracking-[0.16em] text-ink">
              Preview mode · demo numbers, not real market data
            </div>
          )}
          <Nav />
          <main className="pb-16">{children}</main>
          <Footer />
          <Splash />
        </MarketProvider>
      </body>
    </html>
  );
}
