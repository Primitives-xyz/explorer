import { ClientLayout } from './ClientLayout'
import { Toaster } from '@/components/toast/toaster'
import './globals.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title:
    process.env.NEXT_PUBLIC_APP_NAME ||
    'Social Graph Explorer | Tapestry Protocol',
  description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    'Explore social connections, NFTs, and token holdings on Solana. View detailed wallet analytics, track social relationships, and discover new connections in the Tapestry Protocol ecosystem.',
  keywords:
    'Solana, Social Graph, Tapestry Protocol, Blockchain Analytics, NFT Explorer, Wallet Analysis, Social Connections, Web3 Social',
  openGraph: {
    title:
      process.env.NEXT_PUBLIC_APP_NAME ||
      'Social Graph Explorer | Tapestry Protocol',
    description:
      process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
      'Explore social connections, NFTs, and token holdings on Solana. Discover the social fabric of Web3.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://explorer.tapestry.dev',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_TAPESTRY_ASSETS_URL}/explorer-2.png`,
        width: 1200,
        height: 630,
        alt: 'Social Graph Explorer Interface',
      },
    ],
    siteName: process.env.NEXT_PUBLIC_APP_NAME || 'Tapestry Protocol Explorer',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      process.env.NEXT_PUBLIC_APP_NAME ||
      'Social Graph Explorer | Tapestry Protocol',
    description:
      process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
      'Explore social connections and wallet analytics on Solana',
    images: [`${process.env.NEXT_PUBLIC_TAPESTRY_ASSETS_URL}/explorer-2.png`],
    creator: process.env.NEXT_PUBLIC_APP_TWITTER_HANDLE || '@TapestryProto',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical:
      process.env.NEXT_PUBLIC_APP_URL || 'https://explorer.tapestry.dev',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/favicon.png',
    },
  },
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Toaster />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
