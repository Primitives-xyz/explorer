'use client'

import { TokenSection } from '@/components/TokenSection'
import { TransactionSection } from '@/components/TransactionSection'
import { useState } from 'react'

interface PortfolioTabsProps {
  address: string
}

type TokenTab =
  | 'all'
  | 'fungible'
  | 'nft'
  | 'compressed'
  | 'programmable'
  | 'transactions'

export default function PortfolioTabs({ address }: PortfolioTabsProps) {
  const [activeTab, setActiveTab] = useState<TokenTab>('all')

  const renderContent = () => {
    if (activeTab === 'transactions') {
      return <TransactionSection walletAddress={address} hasSearched={true} />
    }

    return (
      <TokenSection
        walletAddress={address}
        hasSearched={true}
        tokenType={activeTab}
        hideTitle={true}
      />
    )
  }

  const getTabStyle = (tab: TokenTab) => {
    const isActive = activeTab === tab
    return `px-4 py-2 font-mono text-sm transition-all duration-300 relative ${
      isActive
        ? 'text-green-300 bg-green-500/10 border border-green-500/30'
        : 'text-green-600 hover:text-green-500 hover:bg-green-500/10'
    }`
  }

  return (
    <>
      <div className="bg-black/50 w-full overflow-hidden flex flex-col">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setActiveTab('all')}
            className={getTabStyle('all')}
          >
            All Tokens
          </button>
          <button
            onClick={() => setActiveTab('fungible')}
            className={getTabStyle('fungible')}
          >
            Fungible
          </button>
          <button
            onClick={() => setActiveTab('nft')}
            className={getTabStyle('nft')}
          >
            Regular NFTs
          </button>
          <button
            onClick={() => setActiveTab('compressed')}
            className={getTabStyle('compressed')}
          >
            Compressed NFTs
          </button>
          <button
            onClick={() => setActiveTab('programmable')}
            className={getTabStyle('programmable')}
          >
            Programmable NFTs
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={getTabStyle('transactions')}
          >
            Transactions
          </button>
        </div>
      </div>

      <div className="mt-8">{renderContent()}</div>
    </>
  )
}
