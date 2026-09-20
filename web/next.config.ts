import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The shared content package is TypeScript source — Next must compile it.
  transpilePackages: ["@f7/content"],
  // Monorepo: trace files from the repo root, not just web/
  outputFileTracingRoot: path.join(__dirname, ".."),
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
