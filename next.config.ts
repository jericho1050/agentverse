import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: __dirname,
  webpack: (config) => {
    // Exclude hardhat config and contracts from Next.js build
    config.externals = [...(config.externals || []), 'hardhat'];
    return config;
  },
  // Exclude hardhat/contracts directories from compilation
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
