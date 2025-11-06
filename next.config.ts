import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for better Vercel deployment
  output: 'standalone',

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Environment variables that should be available on the client side
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Ensure proper redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en/login',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
