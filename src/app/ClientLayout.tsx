'use client'
import { ActivityTape } from '@/components/ActivityTape'
import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

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

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <ActivityTape />
      <div className="w-full overflow-hidden">
        <Header />
        {children}
      </div>
    </WalletProvider>
  )
}
