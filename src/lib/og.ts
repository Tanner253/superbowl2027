import type { Metadata } from "next";
import { SITE } from "@/config/site";

// Share card for X / Telegram (public/og.png, 1200×630).
export const OG_IMAGE = { url: "/og.png?v=48", width: 1200, height: 630, alt: `${SITE.name} · $${SITE.ticker} on pump.fun` };

// Next replaces (doesn't merge) openGraph/twitter per page, so every page builds both here.
export function share(title: string, description: string): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: { siteName: SITE.name, type: "website", title, description, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  };
}
