'use client'
import { ActivityTape } from '@/components/ActivityTape'
import { GlobalSearch } from '@/components/GlobalSearch'
import { AuthWrapper } from '@/components/auth/AuthWrapper'
import dynamic from 'next/dynamic'
import { ReactNode } from 'react'
import { HolderProvider } from '@/components/auth/hooks/use-holder-context'

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
      <HolderProvider>
        <AuthWrapper>
          <ActivityTape />
          <div className="w-full overflow-hidden">
            <Header />
            {children}
          </div>
          <GlobalSearch />
        </AuthWrapper>
      </HolderProvider>
    </WalletProvider>
  )
}
