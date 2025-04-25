import { ActivityTape } from '@/components/activity-tape/components/activity-tape'
import { LeftSideMenu } from '@/components/common/left-side-menu/left-side-menu'
import { AddressHighlightProvider } from '@/components/common/use-address-highlight'
import { WalletProvider } from '@/components/common/wallet-provider'
import { BackgroundLinesEffect } from '@/components/motion/components/background-lines-effect'
import { BackgroundPixelsEffect } from '@/components/motion/components/background-pixels-effect'
import { Scanner } from '@/components/motion/components/scanner'
import { Onboarding } from '@/components/onboarding/components/onboarding'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/utils/utils'
import { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Rethink_Sans } from 'next/font/google'
import './globals.css'

const rethinkSans = Rethink_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const name = 'Solana Social Explorer | Tapestry Protocol'
  const description =
    'Explore social connections, NFTs, and token holdings on Solana. View detailed wallet analytics, track social relationships, and discover new connections in the Tapestry Protocol ecosystem.'
  const url = 'https://sse.gg'

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || url),
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
      <body className={cn('relative min-h-screen', rethinkSans.className)}>
        <NextIntlClientProvider messages={messages}>
          <WalletProvider>
            <AddressHighlightProvider>
              <div className="fixed inset-0 z-0 background-gradient" />
              <BackgroundPixelsEffect />

              <div className="relative z-20">
                <Onboarding />
                <ActivityTape />
                <Toaster />

                <main className="w-full flex justify-between pt-topbar">
                  <LeftSideMenu />
                  <div className="flex-1 flex justify-between pt-5">
                    {children}
                  </div>
                </main>
              </div>

              <Scanner />
              <BackgroundLinesEffect />
            </AddressHighlightProvider>
          </WalletProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
