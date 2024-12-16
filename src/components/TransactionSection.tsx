'use client'

import { Transaction } from '@/utils/helius'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'

const LAMPORTS_PER_SOL = 1000000000

const formatLamportsToSol = (lamports: number) => {
  const sol = Math.abs(lamports) / LAMPORTS_PER_SOL
  return sol.toLocaleString(undefined, {
    minimumFractionDigits: 9,
    maximumFractionDigits: 9,
  })
}

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
  const ITEMS_PER_PAGE = 10

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
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const transactionsData = await response.json()
        if ('error' in transactionsData) {
          throw new Error(transactionsData.error)
        }

        if (page === 1) {
          setTransactions(transactionsData)
        } else {
          setTransactions((prev) => [...prev, ...transactionsData])
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setError('Failed to fetch transactions.')
        if (page === 1) {
          setTransactions([])
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [walletAddress, hasSearched, page])

  const handleLoadMore = () => {
    setPage((prev) => prev + 1)
  }

  if (!hasSearched) return null

  return (
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden flex flex-col max-h-[800px]">
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
        <div className="p-2 mb-4 border border-red-800 bg-red-900/20 text-red-400 flex-shrink-0">
          <span>! ERROR: {error}</span>
        </div>
      )}

      {/* Transaction List */}
      <div className="divide-y divide-green-800/30 overflow-y-auto flex-grow scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-900/50">
        {isLoading && transactions.length === 0 ? (
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> FETCHING TRANSACTIONS...'}
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> NO TRANSACTIONS FOUND'}
          </div>
        ) : (
          <>
            {transactions.map((tx) => (
              <div key={tx.signature} className="p-3 hover:bg-green-900/10">
                <div className="flex flex-col gap-1.5 overflow-hidden">
                  {/* Transaction Header */}
                  <div className="flex items-center justify-between text-xs overflow-x-auto scrollbar-none">
                    <span className="text-green-400 font-mono bg-green-900/20 px-1.5 py-0.5 rounded whitespace-nowrap">
                      {formatDistanceToNow(new Date(tx.timestamp * 1000))} ago
                    </span>
                    <span className="text-green-600 font-mono bg-green-900/20 px-1.5 py-0.5 rounded whitespace-nowrap ml-2">
                      {tx.type}
                    </span>
                  </div>

                  {/* Transaction Details */}
                  <div className="text-base text-green-300 font-mono bg-green-900/10 p-2 rounded overflow-x-auto scrollbar-none break-words">
                    {tx.description}
                  </div>

                  {/* Transfers Container */}
                  <div className="space-y-1 bg-green-900/5 p-1.5 rounded overflow-hidden">
                    {/* Native Transfers */}
                    {tx.nativeTransfers?.map((transfer, i) => (
                      <div
                        key={i}
                        className="text-sm text-green-500 font-mono flex items-center gap-2 overflow-x-auto scrollbar-none whitespace-nowrap"
                      >
                        <span className="text-green-600 flex-shrink-0">
                          {transfer.amount > 0 ? '↓' : '↑'}
                        </span>
                        <span className="bg-green-900/20 px-2 py-0.5 rounded flex-shrink-0 font-semibold">
                          {formatLamportsToSol(transfer.amount)} SOL
                        </span>
                      </div>
                    ))}

                    {/* Token Transfers */}
                    {tx.tokenTransfers?.map((transfer, i) => (
                      <div
                        key={i}
                        className="text-sm text-green-500 font-mono flex items-center gap-2 overflow-x-auto scrollbar-none whitespace-nowrap"
                      >
                        <span className="text-green-600 flex-shrink-0">
                          {transfer.tokenAmount > 0 ? '↓' : '↑'}
                        </span>
                        <span className="bg-green-900/20 px-2 py-0.5 rounded flex-shrink-0 font-semibold">
                          {Math.abs(transfer.tokenAmount)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Transaction Hash */}
                  <div className="text-xs text-green-800 font-mono truncate hover:text-green-600 overflow-hidden pt-0.5">
                    sig: {tx.signature}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Load More Button */}
      {!isLoading && transactions.length > 0 && (
        <div className="border-t border-green-800 p-2 flex-shrink-0">
          <button
            className="w-full text-center text-xs text-green-600 hover:text-green-500 font-mono"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading
              ? '>>> LOADING MORE... <<<'
              : '>>> LOAD MORE TRANSACTIONS <<<'}
          </button>
        </div>
      )}
    </div>
  )
}
