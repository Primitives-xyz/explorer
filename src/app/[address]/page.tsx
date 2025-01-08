'use client'

import { Layout } from '@/components/Layout'
import { WalletProfiles } from '@/components/profile/WalletProfiles'

export default function WalletPage({ params }: { params: { address: string } }) {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <WalletProfiles walletAddress={params.address} />
      </div>
    </Layout>
  )
} 