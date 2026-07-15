import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [70, 80, 90],
  },
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
