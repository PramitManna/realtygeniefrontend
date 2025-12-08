import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure Turbopack
  turbopack: {},
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      }
    ]
  },

  typescript: {
    // Warning: This allows build to continue with TypeScript errors
    ignoreBuildErrors: true,
  },
  poweredByHeader: false,
  compress: true,
  // Production output configuration
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  // Disable dev indicators in production
  devIndicators: process.env.NODE_ENV === 'development',
  onDemandEntries: process.env.NODE_ENV === 'development' ? {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  } : undefined,
  // Security headers for production
  async headers() {
    return process.env.NODE_ENV === 'production' ? [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ] : []
  },
};

export default nextConfig;
