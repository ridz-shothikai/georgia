import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  basePath: "/app1",
  assetPrefix: "/app1",
  // Ensure proper routing when proxied
  trailingSlash: false,
};

export default nextConfig;
