'use client'

import { InnerSwap, Transaction } from '@/utils/helius/types'
import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { TransactionBadge } from './TransactionBadge'
import { TransactionSignature } from './TransactionSignature'
import { TransactionCard } from './TransactionCard'
import {
  formatLamportsToSol,
  formatTokenAmount,
  getTokenSymbol,
} from '@/utils/transaction'

interface TransactionDetailsProps {
  signature: string
}

export default function TransactionDetails({
  signature,
}: TransactionDetailsProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)

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
    const swapEvent = transaction.events?.find((event) => event.type === 'SWAP')
    if (!swapEvent || !('swap' in swapEvent)) return null

    const { tokenInputs, tokenOutputs, innerSwaps } = swapEvent.swap

    // Calculate total input/output for summary
    const totalInput = swapEvent.swap.nativeInput?.amount || '0'
    const totalOutput = swapEvent.swap.tokenOutputs?.[0]?.tokenAmount || '0'

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
                {formatTokenAmount(totalInput)} SOL
              </div>
            </div>
            <div className="px-4 text-green-500">→</div>
            <div className="flex-1 text-right">
              <div className="text-green-400 font-mono text-sm mb-1">
                Output
              </div>
              <div className="text-xl font-mono text-green-300">
                {formatTokenAmount(totalOutput, 6)} USDC
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
              {innerSwaps.map((swap: InnerSwap, index: number) => {
                const inputAmount = swap.tokenInputs[0]?.tokenAmount || '0'
                const outputAmount = swap.tokenOutputs[0]?.tokenAmount || '0'
                const inputDecimals =
                  swap.tokenInputs[0]?.mint ===
                  'So11111111111111111111111111111111111111112'
                    ? 9
                    : 6
                const outputDecimals =
                  swap.tokenOutputs[0]?.mint ===
                  'So11111111111111111111111111111111111111112'
                    ? 9
                    : 6

                return (
                  <div
                    key={index}
                    className="border-l-2 border-green-800/40 pl-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400 font-mono text-sm">
                          Step {index + 1}
                        </span>
                        <TransactionBadge
                          type="SWAP"
                          source={swap.programInfo.source || 'UNKNOWN'}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-green-300 font-mono">
                        {formatTokenAmount(inputAmount, inputDecimals)}{' '}
                        {getTokenSymbol(swap.tokenInputs[0]?.mint)}
                      </div>
                      <div className="px-2 text-green-500">→</div>
                      <div className="text-green-300 font-mono">
                        {formatTokenAmount(outputAmount, outputDecimals)}{' '}
                        {getTokenSymbol(swap.tokenOutputs[0]?.mint)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      {/* Transaction Card */}
      {transaction && (
        <div className="mb-8 border border-green-800/40 rounded-xl bg-black/40">
          <TransactionCard transaction={transaction} sourceWallet="" />
        </div>
      )}

      {/* Transaction Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-mono text-green-500 mb-2">
          Transaction Details
        </h1>
        <TransactionSignature signature={signature} />
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
          <TransactionBadge
            type={transaction.type}
            source={transaction.source}
            size="md"
          />
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
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-green-400 text-sm">
                      {account.account}
                    </span>
                  </div>
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
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-green-500">
                          {change.tokenAccount}
                        </span>
                      </div>
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
