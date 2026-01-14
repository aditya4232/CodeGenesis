import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Only proxy specific backend routes, let Next.js handle its own API routes
      {
        source: '/api/generate/:path*',
        destination: 'http://localhost:8001/generate/:path*',
      },
      {
        source: '/api/test-db/:path*',
        destination: 'http://localhost:8001/test-db/:path*',
      },
    ];
  },
};

export default nextConfig;
