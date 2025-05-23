import { ActivityTape } from '@/components/activity-tape/components/activity-tape'
import { LeftSideMenu } from '@/components/common/left-side-menu/left-side-menu'
import { MobileHeader } from '@/components/common/mobile-menu/mobile-header'
import { AddressHighlightProvider } from '@/components/common/use-address-highlight'
import { WalletProvider } from '@/components/common/wallet-provider'
import { Onboarding } from '@/components/onboarding/components/onboarding'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/utils/utils'
import { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Rethink_Sans } from 'next/font/google'
import Script from 'next/script'
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
      <head>
        <Script id="heap-analytics" strategy="afterInteractive">
          {`
            window.heapReadyCb = window.heapReadyCb || [];
            window.heap = window.heap || [];
            heap.load = function(e, t) {
              window.heap.envId = e;
              window.heap.clientConfig = t = t || {};
              window.heap.clientConfig.shouldFetchServerConfig = !1;
              var a = document.createElement('script');
              a.type = 'text/javascript';
              a.async = !0;
              a.src = 'https://cdn.us.heap-api.com/config/' + e + '/heap_config.js';
              var r = document.getElementsByTagName('script')[0];
              r.parentNode.insertBefore(a, r);
              var n = [
                'init',
                'startTracking',
                'stopTracking',
                'track',
                'resetIdentity',
                'identify',
                'getSessionId',
                'getUserId',
                'getIdentity',
                'addUserProperties',
                'addEventProperties',
                'removeEventProperty',
                'clearEventProperties',
                'addAccountProperties',
                'addAdapter',
                'addTransformer',
                'addTransformerFn',
                'onReady',
                'addPageviewProperties',
                'removePageviewProperty',
                'clearPageviewProperties',
                'trackPageview',
              ];
              var i = function(e) {
                return function() {
                  var t = Array.prototype.slice.call(arguments, 0);
                  window.heapReadyCb.push({
                    name: e,
                    fn: function() {
                      heap[e] && heap[e].apply(heap, t);
                    },
                  });
                };
              };
              for (var p = 0; p < n.length; p++) heap[n[p]] = i(n[p]);
            };
            heap.load('3854626676');
          `}
        </Script>
      </head>
      <body className={cn('relative min-h-screen', rethinkSans.className)}>
        <NextIntlClientProvider messages={messages}>
          <WalletProvider>
            <AddressHighlightProvider>
              <div className="fixed inset-0 z-0 background-gradient" />

              <div className="relative z-20">
                <Toaster />

                <Onboarding />

                <ActivityTape />
                <MobileHeader />
                <main className="w-full md:flex md:justify-between md:pt-topbar">
                  <LeftSideMenu />
                  <div className="flex-1 flex justify-between pt-5">
                    {children}
                  </div>
                </main>
              </div>
            </AddressHighlightProvider>
          </WalletProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
