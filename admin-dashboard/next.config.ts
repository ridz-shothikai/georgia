import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  basePath: "/dashboard",
  assetPrefix: "/dashboard",
  // Ensure proper routing when proxied
  trailingSlash: false,
};

export default nextConfig;
