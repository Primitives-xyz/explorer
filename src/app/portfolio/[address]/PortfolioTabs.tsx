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
          <p className="text-green-600 font-mono">
            No {activeTab === 'fungible' ? 'tokens' : 'NFTs'} found for this wallet
          </p>
        </div>
      )
    }

    if (activeTab === 'nonfungible') {
      return (
        <div className="text-center py-12">
          <p className="text-green-600 font-mono">NFT display coming soon</p>
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
      <div className="border border-green-800 bg-black/50 p-4 rounded-none mb-8">
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('fungible')}
            className={`px-4 py-1.5 font-mono text-sm transition-colors ${
              activeTab === 'fungible'
                ? 'bg-green-900/20 text-green-400 border border-green-800'
                : 'text-green-600 hover:text-green-500 hover:bg-green-900/10'
            }`}
          >
            Tokens ({fungibleTokens.length})
          </button>
          <button
            onClick={() => setActiveTab('nonfungible')}
            className={`px-4 py-1.5 font-mono text-sm transition-colors ${
              activeTab === 'nonfungible'
                ? 'bg-green-900/20 text-green-400 border border-green-800'
                : 'text-green-600 hover:text-green-500 hover:bg-green-900/10'
            }`}
          >
            NFTs ({nonfungibleTokens.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-1.5 font-mono text-sm transition-colors ${
              activeTab === 'transactions'
                ? 'bg-green-900/20 text-green-400 border border-green-800'
                : 'text-green-600 hover:text-green-500 hover:bg-green-900/10'
            }`}
          >
            Transactions ({transactions.length})
          </button>
        </div>
      </div>

      <div className="border border-green-800 bg-black/50 w-full overflow-hidden">
        {renderContent()}
      </div>
    </>
  )
