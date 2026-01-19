import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Only use rewrites in development
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/generate/:path*',
          destination: 'http://localhost:8001/generate/:path*',
        },
        {
          source: '/api/test-db/:path*',
          destination: 'http://localhost:8001/test-db/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
