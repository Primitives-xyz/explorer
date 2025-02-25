import { ActivityTape } from '@/components/activity-tape'
import { AuthWrapper } from '@/components/auth/auth-wrapper'
import WalletProvider from '@/components/auth/wallet-provider'
import { GlobalSearch } from '@/components/global-search'
import { Header } from '@/components/header-container/header'
import { CreateProfile } from '@/components/profile/create-profile'
import { Toaster } from '@/components/toast/toaster'
import { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const name = 'Solana Social Explorer | Tapestry Protocol'
  const description =
    'Explore social connections, NFTs, and token holdings on Solana. View detailed wallet analytics, track social relationships, and discover new connections in the Tapestry Protocol ecosystem.'
  const url = 'https://sse.gg'

  return {
    title: process.env.NEXT_PUBLIC_APP_NAME || name,
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || description,
    keywords:
      'Solana, Social Graph, Tapestry Protocol, Blockchain Analytics, NFT Explorer, Wallet Analysis, Social Connections, Web3 Social',
    openGraph: {
      title: process.env.NEXT_PUBLIC_APP_NAME || name,
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || description,
      type: 'website',
      url: url,
      images: [
        {
          url: `https://assets.usetapestry.dev/sse2.png`,
          width: 1200,
          height: 630,
          alt: 'Solana Social Explorer Interface',
        },
      ],
      siteName: process.env.NEXT_PUBLIC_APP_NAME || name,
    },
    twitter: {
      card: 'summary_large_image',
      title: process.env.NEXT_PUBLIC_APP_NAME || name,
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || description,
      images: [`https://assets.usetapestry.dev/sse2.png`],
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
      canonical: process.env.NEXT_PUBLIC_APP_URL || url,
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
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <WalletProvider>
            <AuthWrapper>
              <Toaster />
              <ActivityTape />
              <div className="xl:p-2 w-full overflow-hidden bg-[#292C31] text-[#F5F8FD] font-mono min-h-dvh">
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
