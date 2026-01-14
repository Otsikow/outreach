import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@outreach/db', '@outreach/shared'],
};

export default nextConfig;
