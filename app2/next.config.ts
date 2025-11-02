import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  basePath: "/region2",
  assetPrefix: "/region2",
  // Ensure proper routing when proxied
  trailingSlash: false,
};

export default nextConfig;
