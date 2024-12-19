'use client'

import TokenCard from '@/components/TokenCard'
import { FungibleToken, Transaction } from '@/utils/helius'
import { useState } from 'react'
import TransactionList from './TransactionList'

interface PortfolioTabsProps {
  address: string
  fungibleTokens: FungibleToken[]
  nonfungibleTokens: any[]
  initialTransactions: Transaction[]
}

export default function PortfolioTabs({
  address,
  fungibleTokens,
  nonfungibleTokens,
  initialTransactions,
}: PortfolioTabsProps) {
  const [activeTab, setActiveTab] = useState<
    'fungible' | 'nonfungible' | 'transactions'
  >('fungible')
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions)
  const [loadingMore, setLoadingMore] = useState(false)

  const loadMoreTransactions = async () => {
    if (transactions.length === 0) return

    setLoadingMore(true)
    try {
      const lastSignature = transactions[transactions.length - 1].signature
      const response = await fetch(
        `/api/transactions?address=${address}&before=${lastSignature}`,
      )
      if (!response.ok) {
        throw new Error('Failed to fetch more transactions')
      }
      const moreTxs = await response.json()
      setTransactions([...transactions, ...moreTxs])
    } catch (error) {
      console.error('Error loading more transactions:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const renderContent = () => {
    if (activeTab === 'transactions') {
      return (
        <TransactionList
          transactions={transactions}
          loadingMore={loadingMore}
          onLoadMore={loadMoreTransactions}
        />
      )
    }

    const tokens = activeTab === 'fungible' ? fungibleTokens : nonfungibleTokens
    if (tokens.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> NO ' + (activeTab === 'fungible' ? 'TOKENS' : 'NFTS') + ' FOUND'}
          </div>
        </div>
      )
    }

    if (activeTab === 'nonfungible') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nonfungibleTokens.map((token) => (
            <TokenCard key={token.id} token={token} tokenType="nonfungible" />
          ))}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fungibleTokens.map((token) => (
          <TokenCard key={token.id} token={token} tokenType="fungible" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="bg-black/50 w-full overflow-hidden flex flex-col">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setActiveTab('fungible')}
            className={`px-4 py-2 font-mono text-sm transition-all duration-300 ${
              activeTab === 'fungible'
                ? 'text-green-400 bg-green-500/5'
                : 'text-green-600 hover:text-green-500 hover:bg-green-500/10'
            }`}
          >
            Tokens ({fungibleTokens.length})
          </button>
          <button
            onClick={() => setActiveTab('nonfungible')}
            className={`px-4 py-2 font-mono text-sm transition-all duration-300 ${
              activeTab === 'nonfungible'
                ? 'text-green-400 bg-green-500/5'
                : 'text-green-600 hover:text-green-500 hover:bg-green-500/10'
            }`}
          >
            NFTs ({nonfungibleTokens.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 font-mono text-sm transition-all duration-300 ${
              activeTab === 'transactions'
                ? 'text-green-400 bg-green-500/5'
                : 'text-green-600 hover:text-green-500 hover:bg-green-500/10'
            }`}
          >
            Transactions ({transactions.length})
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-hidden mt-8">
        <div
          className="absolute right-1 top-1 bottom-1 w-1 opacity-0 transition-opacity duration-300 pointer-events-none"
          style={{
            opacity: 0,
            animation: 'fadeOut 0.3s ease-out',
          }}
        >
          <div className="h-full bg-green-500/5 rounded-full">
            <div
              className="h-16 w-full bg-green-500/10 rounded-full"
              style={{
                animation: 'slideY 3s ease-in-out infinite',
                transformOrigin: 'top',
              }}
            />
          </div>
        </div>
        <div
          className="w-full overflow-hidden divide-y divide-green-800/30 overflow-y-auto scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-900/50"
          onScroll={(e) => {
            const indicator = e.currentTarget.previousSibling as HTMLElement
            if (e.currentTarget.scrollTop > 0) {
              indicator.style.opacity = '1'
              indicator.style.animation = 'fadeIn 0.3s ease-out'
            } else {
              indicator.style.opacity = '0'
              indicator.style.animation = 'fadeOut 0.3s ease-out'
            }
          }}
        >
          {renderContent()}
        </div>
      </div>
    </>
  )
}
