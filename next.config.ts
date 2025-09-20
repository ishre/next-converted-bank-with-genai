import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix for React Server Components bundler issues
  serverExternalPackages: ['@google/generative-ai'],
  // Disable turbopack in development to avoid bundler issues
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config: any) => {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      return config;
    },
  }),
};

export default nextConfig;
