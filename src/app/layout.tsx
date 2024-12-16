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
export const metadata: Metadata = {
  title: 'Social Graph Explorer',
  description: 'Explore social connections on Tapestry Protocol',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  )
}
