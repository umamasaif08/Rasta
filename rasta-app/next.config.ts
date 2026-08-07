import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict mode for catching bugs early
  reactStrictMode: true,

  images: {
    // Allow Firebase Storage domain once org photos are added (Phase 3+)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
