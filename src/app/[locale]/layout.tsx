import { ActivityTape } from '@/components/activity-tape'
import { AuthWrapper } from '@/components/auth/auth-wrapper'
import WalletProvider from '@/components/auth/wallet-provider'
import { GlobalSearch } from '@/components/global-search'
import { Header } from '@/components/header/header'
import { CreateProfile } from '@/components/profile/create-profile'
import { locales } from '@/i18n'
import { routing } from '@/i18n/routing'
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { Toaster } from 'sonner'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  const messages = (await import(`@/messages/${locale}.json`)).default
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
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
