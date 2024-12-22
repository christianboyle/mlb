import type { NextConfig } from 'next';
import { PORT } from './server.config';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    dynamicIO: true,
    serverActions: {
      allowedOrigins: [
        'localhost:3456',
        'mlb.christianboyle.com'
      ],
    },
  },
  serverExternalPackages: [],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a.espncdn.com',
        port: '',
        pathname: '/i/teamlogos/**',
      },
    ],
  },
  reactStrictMode: true,
  output: 'standalone',
  httpAgentOptions: {
    keepAlive: true,
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://mlb.christianboyle.com' : '',
  basePath: '',
  trailingSlash: false,
};

export default nextConfig;
