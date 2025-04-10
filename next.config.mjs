import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    turbo: {
      resolveAlias: {
        '@drift/common': '../drift-common/common-ts/lib',
        '@drift-labs/react': '../drift-common/react/lib',
      },
    },
  },
}

export default withNextIntl(nextConfig)
