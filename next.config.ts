import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: __dirname,
  serverExternalPackages: [
    '@anthropic-ai/bedrock-sdk',
    '@aws-sdk/client-bedrock-runtime',
    '@aws-sdk/credential-provider-node',
    '@aws-sdk/credential-provider-sso',
    '@aws-sdk/credential-provider-ini',
  ],
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'hardhat'];
    return config;
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
