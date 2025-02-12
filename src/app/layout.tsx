import { ActivityTape } from '@/components/activity-tape'
import { AuthWrapper } from '@/components/auth/auth-wrapper'
import WalletProvider from '@/components/auth/wallet-provider'
import { GlobalSearch } from '@/components/global-search'
import { Header } from '@/components/header-container/header'
import { CreateProfile } from '@/components/profile/create-profile'
import { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title:
    process.env.NEXT_PUBLIC_APP_NAME ||
    'Solana Social Explorer | Tapestry Protocol',
  description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    'Explore social connections, NFTs, and token holdings on Solana. View detailed wallet analytics, track social relationships, and discover new connections in the Tapestry Protocol ecosystem.',
  keywords:
    'Solana, Social Graph, Tapestry Protocol, Blockchain Analytics, NFT Explorer, Wallet Analysis, Social Connections, Web3 Social',
  openGraph: {
    title:
      process.env.NEXT_PUBLIC_APP_NAME ||
      'Solana Social Explorer | Tapestry Protocol',
    description:
      process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
      'Explore social connections, NFTs, and token holdings on Solana. Discover the social fabric of Web3.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://explorer.usetapestry.dev',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_TAPESTRY_ASSETS_URL}/explorer-2.png`,
        width: 1200,
        height: 630,
        alt: 'Solana Social Explorer Interface',
      },
    ],
    siteName: process.env.NEXT_PUBLIC_APP_NAME || 'Tapestry Protocol Explorer',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      process.env.NEXT_PUBLIC_APP_NAME ||
      'Solana Social Explorer | Tapestry Protocol',
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
      process.env.NEXT_PUBLIC_APP_URL || 'https://explorer.usetapestry.dev',
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()

  console.log('locale', locale)

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <WalletProvider>
            <AuthWrapper>
              <Toaster />
              <ActivityTape />
              <div className="w-full overflow-hidden bg-black text-green-400 font-mono min-h-dvh">
                <Header />
                {children}
              </div>
              <GlobalSearch />
              <CreateProfile />
            </AuthWrapper>
          </WalletProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
