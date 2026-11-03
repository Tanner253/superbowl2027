import type { NextConfig } from "next";

// Pages are still prerendered as static HTML; the one exception is /api/stats, which reads the
// crank's stats from MongoDB on Vercel.
const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
