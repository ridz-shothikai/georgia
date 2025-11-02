import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  basePath: "/region14",
  assetPrefix: "/region14",
  // Ensure proper routing when proxied
  trailingSlash: false,
};

export default nextConfig;
