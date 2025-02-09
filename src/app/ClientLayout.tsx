'use client'
import { ActivityTape } from '@/components/ActivityTape'
import { GlobalSearch } from '@/components/GlobalSearch'
import { AuthWrapper } from '@/components/auth/AuthWrapper'
import { CreateProfile } from '@/components/profile/create-profile'
import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

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
      <AuthWrapper>
        <ActivityTape />
        <div className="w-full overflow-hidden bg-black text-green-400 font-mono min-h-dvh ">
          <Header />
          {children}
        </div>
        <GlobalSearch />
        <CreateProfile />
      </AuthWrapper>
    </WalletProvider>
  )
}
