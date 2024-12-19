import { ActivityTape } from '@/components/ActivityTape'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { ReactNode } from 'react'
import './globals.css'

const WalletProvider = dynamic(
  () => import('@/components/auth/dynamic-provider').then((mod) => mod.default),
  {
    ssr: false,
  },
)

const Header = dynamic(
  () => import('@/components/Header').then((mod) => mod.Header),
  {
    ssr: false,
  },
)

export const metadata: Metadata = {
  title: 'Social Graph Explorer',
  description: 'Explore social connections on Tapestry Protocol',
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <ActivityTape />
          <div className="w-full overflow-hidden">
            <Header />
            {children}
          </div>
        </WalletProvider>
      </body>
    </html>
  )
}
