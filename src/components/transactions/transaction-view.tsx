'use client'

import type { Transaction } from '@/utils/helius/types'
import {
  formatLamportsToSol,
  formatTokenAmount,
  getTokenSymbol,
} from '@/utils/transaction'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'
import { TransactionBadge } from './transaction-badge'
import { TransactionCard } from './transaction-card'
import { TransactionSignature } from './transaction-signature'

interface TransactionDetailsProps {
  signature: string
}

export default function TransactionDetails({
  signature,
}: TransactionDetailsProps) {
  const [state, setState] = useState<{
    transaction: Transaction | null
    isLoading: boolean
    error: string | null
  }>({
    transaction: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    if (!signature) return

    const fetchTransaction = async () => {
      try {
        const response = await fetch('/api/parse-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signature }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(
            typeof data.error === 'object'
              ? JSON.stringify(data.error)
              : data.error
          )
        }

        setState({ transaction: data, isLoading: false, error: null })
      } catch (err) {
        setState({
          transaction: null,
          isLoading: false,
          error:
            err instanceof Error ? err.message : 'Failed to fetch transaction',
        })
      }
    }

    setState((prev) => ({ ...prev, isLoading: true }))
    fetchTransaction()
  }, [signature])

  const { transaction, isLoading, error } = state

  if (isLoading) {
    return (
      <div className="py-8">
        <div className=" font-mono text-center">
          Loading transaction details...
        </div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="py-8">
        <div className="text-red-500 font-mono text-center">
          {error || 'Transaction not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mb-8 border border-green-800/40 rounded-xl bg-black/40">
        <TransactionCard
          transaction={transaction}
          sourceWallet={transaction.feePayer || ''}
        />
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-mono  mb-2">Transaction Details</h1>
        <TransactionSignature signature={signature} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
          <h3 className="/60 text-sm font-mono mb-2">Timestamp</h3>
          <div className="text-xl font-mono ">
            {formatDistanceToNow(new Date(transaction.timestamp * 1000))} ago
          </div>
        </div>

        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
          <h3 className="/60 text-sm font-mono mb-2">Type</h3>
          <TransactionBadge
            type={transaction.type}
            source={transaction.source}
            size="md"
          />
        </div>

        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
          <h3 className="/60 text-sm font-mono mb-2">Fee</h3>
          <div className="text-xl font-mono ">
            {formatLamportsToSol(transaction.fee)} SOL
          </div>
        </div>
      </div>

      <div className="mb-8 p-6 bg-black/40 border border-green-800/40 rounded-xl">
        <h3 className="/60 text-sm font-mono mb-2">Description</h3>
        <div className=" font-mono">
          {transaction.description || 'No description available'}
        </div>
      </div>

      <div className="mb-8 p-6 bg-black/40 border border-green-800/40 rounded-xl">
        <h3 className="/60 text-sm font-mono mb-4">Account Changes</h3>
        <div className="space-y-3">
          {transaction.accountData
            .filter(
              (acc) =>
                acc.nativeBalanceChange !== 0 ||
                acc.tokenBalanceChanges.length > 0
            )
            .map((account, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 pb-3 border-b border-green-800/20 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono  text-sm">
                      {account.account}
                    </span>
                  </div>
                  {account.nativeBalanceChange !== 0 && (
                    <span
                      className={`font-mono text-sm ${
                        account.nativeBalanceChange > 0 ? '' : 'text-red-400'
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
                  return (
                    <div
                      key={changeIndex}
                      className="flex items-center justify-between pl-4 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono ">
                          {change.tokenAccount}
                        </span>
                      </div>
                      <span
                        className={`font-mono ${
                          amount > 0 ? '' : 'text-red-400'
                        }`}
                      >
                        {amount > 0 ? '+' : ''}
                        {formatTokenAmount(
                          change.rawTokenAmount.tokenAmount,
                          change.rawTokenAmount.decimals
                        )}{' '}
                        {getTokenSymbol(change.mint)}
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
