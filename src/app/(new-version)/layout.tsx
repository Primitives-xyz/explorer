import { Header } from '@/components-new-version/common/header'
import { LeftSideMenu } from '@/components-new-version/common/left-side-menu/left-side-menu'
import { WalletProvider } from '@/components-new-version/common/wallet-provider'
import { Onboarding } from '@/components-new-version/onboarding/components/onboarding'
import { Rethink_Sans } from 'next/font/google'
import { ReactNode } from 'react'
import './global.css'

const rethinkSans = Rethink_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export default async function NewVersionLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <WalletProvider>
      <div className={rethinkSans.className}>
        <Onboarding />
        <div className="fixed inset-0 z-0 background-gradient" />
        <div className="relative min-h-screen">
          <Header />
          <main className="w-full flex justify-between pt-topbar">
            <LeftSideMenu />
            <div className="flex-1 flex justify-between pt-5">{children}</div>
          </main>
        </div>
      </div>
    </WalletProvider>
  )
}
