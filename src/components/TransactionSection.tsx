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

const getTransactionTypeColor = (type: string, source: string) => {
  // First check for known marketplaces
  switch (source) {
    case 'MAGIC_EDEN':
      return 'bg-purple-900/50 text-purple-400 border-purple-800'
    case 'TENSOR':
      return 'bg-blue-900/50 text-blue-400 border-blue-800'
    case 'RAYDIUM':
      return 'bg-teal-900/50 text-teal-400 border-teal-800'
    case 'JUPITER':
      return 'bg-orange-900/50 text-orange-400 border-orange-800'
  }

  // Then fall back to transaction type colors
  switch (type) {
    case 'COMPRESSED_NFT_MINT':
      return 'bg-pink-900/50 text-pink-400 border-pink-800'
    case 'TRANSFER':
      return 'bg-blue-900/50 text-blue-400 border-blue-800'
    case 'SWAP':
      return 'bg-orange-900/50 text-orange-400 border-orange-800'
    case 'DEPOSIT':
      return 'bg-green-900/50 text-green-400 border-green-800'
    default:
      return 'bg-gray-900/50 text-gray-400 border-gray-800'
  }
}

const getSourceIcon = (source: string) => {
  switch (source) {
    case 'MAGIC_EDEN':
      return '🪄'
    case 'TENSOR':
      return '⚡'
    case 'RAYDIUM':
      return '💧'
    case 'JUPITER':
      return '🌌'
    case 'SYSTEM_PROGRAM':
      return '💻'
    default:
      return null
  }
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
            transactions[transactions.length - 1].signature,
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

  const formatTimestamp = (timestamp: number | string) => {
    try {
      const date =
        typeof timestamp === 'number'
          ? new Date(timestamp * 1000)
          : new Date(timestamp)
      return formatDistanceToNow(date)
    } catch (error) {
      console.error('Error formatting timestamp:', error)
      return 'Unknown time'
    }
  }

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
              <div
                key={tx.signature}
                className="p-2 hover:bg-green-900/10 cursor-pointer transition-all duration-200"
                onClick={() =>
                  setExpandedTx(
                    expandedTx === tx.signature ? null : tx.signature,
                  )
                }
              >
                <div className="flex flex-col gap-1">
                  {/* Transaction Header */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-mono">
                        {formatTimestamp(tx.timestamp)} ago
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded border ${getTransactionTypeColor(
                            tx.type,
                            tx.source,
                          )} text-xs font-mono`}
                        >
                          {tx.type}
                        </span>
                        {tx.source && (
                          <span
                            className={`px-2 py-0.5 rounded border ${getTransactionTypeColor(
                              tx.type,
                              tx.source,
                            )} text-xs font-mono flex items-center gap-1`}
                          >
                            {getSourceIcon(tx.source)}
                            <span>{tx.source}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-mono">
                        {tx.fee
                          ? `${(tx.fee / LAMPORTS_PER_SOL).toFixed(5)} SOL`
                          : ''}
                      </span>
                      <a
                        href={`https://solscan.io/tx/${tx.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-500 font-mono"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View
                      </a>
                    </div>
                  </div>

                  {/* Transaction Description */}
                  <div className="text-sm text-green-300 font-mono break-words">
                    {tx.description || 'No description available'}
                  </div>

                  {/* Balance Changes Summary */}
                  {tx.balanceChanges &&
                    Object.keys(tx.balanceChanges).length > 0 && (
                      <div className="text-xs text-green-500 font-mono mt-1">
                        {Object.entries(tx.balanceChanges).map(
                          ([account, change], i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span
                                className={
                                  change > 0 ? 'text-green-400' : 'text-red-400'
                                }
                              >
                                {change > 0 ? '+' : ''}
                                {Number(change).toFixed(4)} SOL
                              </span>
                              <span className="text-green-700">
                                {account === walletAddress
                                  ? '(you)'
                                  : `(${account.slice(0, 4)}...${account.slice(
                                      -4,
                                    )})`}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                  {/* Transfers */}
                  <div className="space-y-0.5">
                    {tx.nativeTransfers?.map((transfer, i) => (
                      <div
                        key={i}
                        className="text-xs text-green-500 font-mono flex items-center gap-1"
                      >
                        <span>
                          {transfer.fromUserAccount === walletAddress
                            ? '↑'
                            : '↓'}
                        </span>
                        <span>{formatLamportsToSol(transfer.amount)} SOL</span>
                        <span className="text-green-700">
                          {transfer.fromUserAccount === walletAddress
                            ? 'to'
                            : 'from'}
                        </span>
                        <span className="text-green-600 text-xs">
                          {(transfer.fromUserAccount === walletAddress
                            ? transfer.toUserAccount
                            : transfer.fromUserAccount
                          ).slice(0, 4)}
                          ...
                          {(transfer.fromUserAccount === walletAddress
                            ? transfer.toUserAccount
                            : transfer.fromUserAccount
                          ).slice(-4)}
                        </span>
                      </div>
                    ))}
                    {tx.tokenTransfers?.map((transfer, i) => (
                      <div
                        key={i}
                        className="text-xs text-green-500 font-mono flex items-center gap-1"
                      >
                        <span>
                          {transfer.from === walletAddress ? '↑' : '↓'}
                        </span>
                        <span>
                          {transfer.amount || 0}{' '}
                          {transfer.tokenMint
                            ? `${transfer.tokenMint.slice(0, 4)}...`
                            : 'Unknown'}
                        </span>
                        <span className="text-green-700">
                          {transfer.from === walletAddress ? 'to' : 'from'}
                        </span>
                        <span className="text-green-600 text-xs">
                          {(
                            (transfer.from === walletAddress
                              ? transfer.to
                              : transfer.from) || ''
                          ).slice(0, 4)}
                          ...
                          {(
                            (transfer.from === walletAddress
                              ? transfer.to
                              : transfer.from) || ''
                          ).slice(-4)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Parsed Instructions (Expanded View) */}
                  {expandedTx === tx.signature && tx.parsedInstructions && (
                    <div className="mt-2 space-y-2">
                      <div className="text-xs text-green-400 font-mono">
                        Instructions:
                      </div>
                      {tx.parsedInstructions.map((ix: any, index: number) => (
                        <div
                          key={index}
                          className="pl-2 border-l-2 border-green-800"
                        >
                          <div className="text-xs text-green-500 font-mono">
                            Program: {ix.programId.slice(0, 4)}...
                            {ix.programId.slice(-4)}
                          </div>
                          {ix.decodedData && (
                            <div className="text-xs text-green-400 font-mono pl-2 mt-1">
                              <pre className="whitespace-pre-wrap break-all">
                                {JSON.stringify(ix.decodedData, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
