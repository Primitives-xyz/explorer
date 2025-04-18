import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@coral-xyz/anchor"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        tls: false,
        net: false,
        dgram: false,
        dns: false,
      };
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/7.x/shapes/svg/**',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
  },
  experimental: {
    webpackMemoryOptimizations: true,
  },
  turbopack: {
    resolveAlias: {
      fs: { browser: './node-browser-compatibility/index.js' },
    },
  },
}

export default withNextIntl(nextConfig)
