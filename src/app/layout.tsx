import { Metadata } from 'next'
import { ReactNode } from 'react'
import { ClientLayout } from './ClientLayout'
import { Toaster } from '@/components/toast/toaster'
import './globals.css'
export const metadata: Metadata = {
  title: 'Social Graph Explorer | Tapestry Protocol',
  description:
    'Explore social connections, NFTs, and token holdings on Solana. View detailed wallet analytics, track social relationships, and discover new connections in the Tapestry Protocol ecosystem.',
  keywords:
    'Solana, Social Graph, Tapestry Protocol, Blockchain Analytics, NFT Explorer, Wallet Analysis, Social Connections, Web3 Social',
  openGraph: {
    title: 'Social Graph Explorer | Tapestry Protocol',
    description:
      'Explore social connections, NFTs, and token holdings on Solana. Discover the social fabric of Web3.',
    type: 'website',
    url: 'https://explorer.tapestry.dev',
    images: [
      {
        url: 'https://assets.usetapestry.dev/explorer-2.png',
        width: 1200,
        height: 630,
        alt: 'Social Graph Explorer Interface',
      },
    ],
    siteName: 'Tapestry Protocol Explorer',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Graph Explorer | Tapestry Protocol',
    description: 'Explore social connections and wallet analytics on Solana',
    images: ['https://assets.usetapestry.dev/explorer-2.png'],
    creator: '@TapestryProto',
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
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://explorer.tapestry.dev',
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
