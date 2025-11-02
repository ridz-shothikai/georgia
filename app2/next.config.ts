import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  basePath: "/app2",
  assetPrefix: "/app2",
  // Ensure proper routing when proxied
  trailingSlash: false,
};

export default nextConfig;
