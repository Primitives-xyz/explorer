'use client'

import {
  Transaction,
  InnerSwap,
  TokenBalanceChange,
  SwapTokenInfo,
} from '@/utils/helius/types'
import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

const LAMPORTS_PER_SOL = 1000000000

// Helper function to format token amounts based on decimals
const formatTokenAmount = (amount: string | number, decimals: number = 9) => {
  const value = Number(amount) / Math.pow(10, decimals)
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })
}

// Helper to get token symbol
const getTokenSymbol = (mint: string) => {
  switch (mint) {
    case 'So11111111111111111111111111111111111111112':
      return 'SOL'
    case 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v':
      return 'USDC'
    default:
      return 'Unknown'
  }
}

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

interface TransactionDetailsProps {
  signature: string
}

export default function TransactionDetails({
  signature,
}: TransactionDetailsProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!signature) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/parse-transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ signature }),
        })

        const data = await response.json()

        if (!response.ok) {
          // Handle error message properly whether it's a string or object
          const errorMessage =
            typeof data.error === 'object'
              ? JSON.stringify(data.error)
              : data.error || 'Failed to fetch transaction'
          throw new Error(errorMessage)
        }

        setTransaction(data)
      } catch (err) {
        console.error('Error fetching transaction:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to fetch transaction',
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransaction()
  }, [signature])

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-green-500 font-mono text-center">
          Loading transaction details...
        </div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-red-500 font-mono text-center">
          {error || 'Transaction not found'}
        </div>
      </div>
    )
  }

  const renderSwapDetails = () => {
    if (!transaction.events?.swap) return null

    const { tokenInputs, tokenOutputs, innerSwaps } = transaction.events.swap

    return (
      <div className="mb-8 space-y-6">
        {/* Main Swap Summary */}
        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
          <h3 className="text-green-500/60 text-sm font-mono mb-4">
            Swap Summary
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-green-400 font-mono text-sm mb-1">Input</div>
              <div className="text-xl font-mono text-green-300">
                {formatTokenAmount(
                  transaction.events.swap.nativeInput?.amount || 0,
                )}{' '}
                SOL
              </div>
            </div>
            <div className="px-4 text-green-500">→</div>
            <div className="flex-1 text-right">
              <div className="text-green-400 font-mono text-sm mb-1">
                Output
              </div>
              <div className="text-xl font-mono text-green-300">
                {formatTokenAmount(
                  transaction.events.swap.tokenOutputs[0]?.tokenAmount || 0,
                  6,
                )}{' '}
                USDC
              </div>
            </div>
          </div>
        </div>

        {/* Inner Swaps */}
        {innerSwaps && innerSwaps.length > 0 && (
          <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
            <h3 className="text-green-500/60 text-sm font-mono mb-4">
              Route Details
            </h3>
            <div className="space-y-4">
              {innerSwaps.map((swap: InnerSwap, index: number) => (
                <div
                  key={index}
                  className="border-l-2 border-green-800/40 pl-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-mono text-sm">
                        Step {index + 1}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded border text-xs font-mono ${getTransactionTypeColor(
                          'SWAP',
                          swap.programInfo.source || 'UNKNOWN',
                        )}`}
                      >
                        {swap.programInfo.source || 'UNKNOWN'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-green-300 font-mono">
                      {formatTokenAmount(swap.tokenInputs[0]?.tokenAmount || 0)}{' '}
                      {getTokenSymbol(swap.tokenInputs[0]?.mint)}
                    </div>
                    <div className="px-2 text-green-500">→</div>
                    <div className="text-green-300 font-mono">
                      {formatTokenAmount(
                        swap.tokenOutputs[0]?.tokenAmount || 0,
                        6,
                      )}{' '}
                      {getTokenSymbol(swap.tokenOutputs[0]?.mint)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      {/* Transaction Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-mono text-green-500 mb-2">
          Transaction Details
        </h1>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-green-400 break-all">
            {signature}
          </span>
          <a
            href={`https://solscan.io/tx/${signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-500 font-mono text-sm"
          >
            View on Solscan
          </a>
        </div>
      </div>

      {/* Transaction Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
          <h3 className="text-green-500/60 text-sm font-mono mb-2">
            Timestamp
          </h3>
          <div className="text-xl font-mono text-green-400">
            {formatDistanceToNow(new Date(transaction.timestamp * 1000))} ago
          </div>
        </div>

        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
          <h3 className="text-green-500/60 text-sm font-mono mb-2">Type</h3>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded border text-sm font-mono ${getTransactionTypeColor(
                transaction.type,
                transaction.source,
              )}`}
            >
              {transaction.type}
            </span>
            {transaction.source && (
              <span
                className={`px-3 py-1 rounded border text-sm font-mono flex items-center gap-1 ${getTransactionTypeColor(
                  transaction.type,
                  transaction.source,
                )}`}
              >
                {getSourceIcon(transaction.source)}
                <span>{transaction.source}</span>
              </span>
            )}
          </div>
        </div>

        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
          <h3 className="text-green-500/60 text-sm font-mono mb-2">Fee</h3>
          <div className="text-xl font-mono text-green-400">
            {formatLamportsToSol(transaction.fee)} SOL
          </div>
        </div>
      </div>

      {/* Transaction Description */}
      <div className="mb-8 p-6 bg-black/40 border border-green-800/40 rounded-xl">
        <h3 className="text-green-500/60 text-sm font-mono mb-2">
          Description
        </h3>
        <div className="text-green-400 font-mono">
          {transaction.description || 'No description available'}
        </div>
      </div>

      {/* Swap Details */}
      {renderSwapDetails()}

      {/* Account Changes */}
      <div className="mb-8 p-6 bg-black/40 border border-green-800/40 rounded-xl">
        <h3 className="text-green-500/60 text-sm font-mono mb-4">
          Account Changes
        </h3>
        <div className="space-y-3">
          {transaction.accountData
            .filter(
              (acc) =>
                acc.nativeBalanceChange !== 0 ||
                acc.tokenBalanceChanges.length > 0,
            )
            .map((account, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 pb-3 border-b border-green-800/20 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-green-400 text-sm">
                    {account.account.slice(0, 4)}...{account.account.slice(-4)}
                  </span>
                  {account.nativeBalanceChange !== 0 && (
                    <span
                      className={`font-mono text-sm ${
                        account.nativeBalanceChange > 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {account.nativeBalanceChange > 0 ? '+' : ''}
                      {formatTokenAmount(account.nativeBalanceChange)} SOL
                    </span>
                  )}
                </div>
                {account.tokenBalanceChanges.map((change, changeIndex) => {
                  const amount =
                    Number(change.rawTokenAmount.tokenAmount) /
                    Math.pow(10, change.rawTokenAmount.decimals)
                  const symbol = getTokenSymbol(change.mint)
                  return (
                    <div
                      key={changeIndex}
                      className="flex items-center justify-between pl-4 text-sm"
                    >
                      <span className="font-mono text-green-500">
                        {change.mint.slice(0, 4)}...{change.mint.slice(-4)}
                      </span>
                      <span
                        className={`font-mono ${
                          amount > 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {amount > 0 ? '+' : ''}
                        {formatTokenAmount(
                          change.rawTokenAmount.tokenAmount,
                          change.rawTokenAmount.decimals,
                        )}{' '}
                        {symbol}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
