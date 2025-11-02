import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  basePath: "/admin-dashboard",
  assetPrefix: "/admin-dashboard",
  // Ensure proper routing when proxied
  trailingSlash: false,
};

export default nextConfig;
