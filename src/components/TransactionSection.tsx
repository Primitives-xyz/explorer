'use client'

import { Transaction } from '@/utils/helius'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'

const LAMPORTS_PER_SOL = 1000000000

const formatLamportsToSol = (lamports: number) => {
  const sol = Math.abs(lamports) / LAMPORTS_PER_SOL
  return sol.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

interface TransactionSectionProps {
  walletAddress: string
  hasSearched?: boolean
  maxHeight?: string
}

export const TransactionSection = ({
  walletAddress,
  hasSearched,
  maxHeight = '484px',
}: TransactionSectionProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
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
            transactions[transactions.length - 1].signature,
          )
        }

        const response = await fetch(url)
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`)
        const transactionsData = await response.json()
        if ('error' in transactionsData) throw new Error(transactionsData.error)

        setTransactions(
          page === 1
            ? transactionsData
            : (prev) => [...prev, ...transactionsData],
        )
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setError('Failed to fetch transactions.')
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
            {transactions.map((tx) => (
              <div key={tx.signature} className="p-2 hover:bg-green-900/10">
                <div className="flex flex-col gap-1">
                  {/* Transaction Header */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-400 font-mono">
                      {formatDistanceToNow(new Date(tx.timestamp * 1000))} ago
                    </span>
                    <span className="text-green-600 font-mono">{tx.type}</span>
                  </div>

                  {/* Transaction Details */}
                  <div className="text-sm text-green-300 font-mono break-words">
                    {tx.description}
                  </div>

                  {/* Transfers */}
                  <div className="space-y-0.5">
                    {tx.nativeTransfers?.map((transfer, i) => (
                      <div
                        key={i}
                        className="text-xs text-green-500 font-mono flex items-center gap-1"
                      >
                        <span>{transfer.amount > 0 ? '↓' : '↑'}</span>
                        <span>{formatLamportsToSol(transfer.amount)} SOL</span>
                      </div>
                    ))}
                    {tx.tokenTransfers?.map((transfer, i) => (
                      <div
                        key={i}
                        className="text-xs text-green-500 font-mono flex items-center gap-1"
                      >
                        <span>{transfer.tokenAmount > 0 ? '↓' : '↑'}</span>
                        <span>{Math.abs(transfer.tokenAmount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Load More */}
      {!isLoading && transactions.length > 0 && (
        <button
          className="w-full p-1 text-xs text-green-600 hover:text-green-500 font-mono border-t border-green-800"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
