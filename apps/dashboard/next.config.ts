import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*'],
  async rewrites() {
    return [
      {
        source: '/api-backend/:path*',
        destination: 'http://api:3000/v1/:path*',
      },
    ]
  },
};

export default nextConfig;
