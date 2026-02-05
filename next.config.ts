import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  /* config options here */
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
