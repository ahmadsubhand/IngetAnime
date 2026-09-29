import type { NextConfig } from "next";

const apiUrl = new URL(process.env.NEXT_PUBLIC_API_BASE_URL!);

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
        pathname: '/images/anime/**',
      },
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
