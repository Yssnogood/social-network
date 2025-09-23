import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "(*)?.giphy.com"
      },
      {
        protocol: "https",
        hostname: "(*.)?tenor.com"
      }
    ],
  },
};

export default nextConfig;
