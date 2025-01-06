'use client'

import { Transaction } from '@/utils/helius/types'
import { useEffect, useState } from 'react'
import { TransactionCard } from './transactions/TransactionCard'
import { isSpamTransaction } from '@/utils/transaction'

interface TransactionSectionProps {
  walletAddress: string
  hasSearched?: boolean
}

export const TransactionSection = ({
  walletAddress,
  hasSearched,
}: TransactionSectionProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [expandedTx, setExpandedTx] = useState<string | null>(null)
  const ITEMS_PER_PAGE = 5

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!walletAddress || !hasSearched) return

      setIsLoading(true)
      setError(null)

      try {
        const url = new URL('/api/transactions', window.location.origin)
        url.searchParams.set('address', walletAddress)
        url.searchParams.set('limit', ITEMS_PER_PAGE.toString())
        if (page > 1 && transactions.length > 0) {
          url.searchParams.set(
            'before',
            transactions[transactions.length - 1].timestamp.toString(),
          )
        }

        const response = await fetch(url)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          )
        }

        const transactionsData = await response.json()
        console.log('transactionsData', transactionsData.slice(0, 5))
        if ('error' in transactionsData) throw new Error(transactionsData.error)

        setTransactions(
          page === 1
            ? transactionsData
            : (prev) => [...prev, ...transactionsData],
        )
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch transactions.',
        )
        if (page === 1) setTransactions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [walletAddress, hasSearched, page])

  if (!hasSearched) return null

  return (
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden flex flex-col relative group h-[484px]">
      {/* Header */}
      <div className="border-b border-green-800 p-2 flex-shrink-0">
        <div className="flex justify-between items-center overflow-x-auto scrollbar-none">
          <div className="text-green-500 text-sm font-mono whitespace-nowrap">
            {'>'} transaction_log.sol
          </div>
          <div className="text-xs text-green-600 font-mono whitespace-nowrap ml-2">
            COUNT: {transactions.length}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-1.5 text-xs border border-red-800 bg-red-900/20 text-red-400">
          {error}
        </div>
      )}

      {/* Transaction List */}
      <div className="divide-y divide-green-800/30 overflow-y-auto flex-grow scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-900/50">
        {isLoading && transactions.length === 0 ? (
          <div className="p-2 text-center text-green-600 text-sm font-mono">
            Loading...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-2 text-center text-green-600 text-sm font-mono">
            No transactions
          </div>
        ) : (
          <>
            {transactions
              .filter((tx) => !isSpamTransaction(tx))
              .map((tx) => (
                <TransactionCard
                  key={tx.signature}
                  transaction={tx}
                  sourceWallet={walletAddress}
                  isExpanded={expandedTx === tx.signature}
                  onExpand={() =>
                    setExpandedTx(
                      expandedTx === tx.signature ? null : tx.signature,
                    )
                  }
                />
              ))}
          </>
        )}
      </div>

      {/* Load More */}
      {!isLoading && transactions.length > 0 && (
        <button
          className="w-full p-1 text-xs text-green-600 hover:text-green-500 font-mono border-t border-green-800 transition-colors duration-200"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
