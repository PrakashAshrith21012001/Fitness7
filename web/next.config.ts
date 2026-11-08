import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The shared content package is TypeScript source — Next must compile it.
  transpilePackages: ["@f7/content"],
  // Monorepo: trace files from the repo root, not just web/
  outputFileTracingRoot: path.join(__dirname, ".."),
  images: {
    // Serve the photos as they are (they're already web-sized JPGs). On-the-fly
    // AVIF/WebP conversion with sharp pushed the 512 MB Render instance to ~900 MB
    // and crashed it. Blur placeholders and lazy loading still work.
    unoptimized: true,
  },
};

export default nextConfig;
