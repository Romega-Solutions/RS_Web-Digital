import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85],
  },
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
