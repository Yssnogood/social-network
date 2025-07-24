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
        hostname: "media2.giphy.com"
      },
      {
        protocol: "https",
        hostname: "media.giphy.com"
      },
      {
        protocol: "https",
        hostname: "media3.giphy.com"
      }
    ],
  },
};

export default nextConfig;
