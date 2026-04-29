import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    qualities: [75, 85],
  },
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
