'use client'

import { Transaction } from '@/utils/helius/types'
import { useEffect, useState } from 'react'
import { TransactionCard } from './transactions/TransactionCard'
import { isSpamTransaction } from '@/utils/transaction'
import { SwapActivityItem } from './transactions/SwapActivityItem'

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
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-1 p-2">
        {isLoading ? (
          <LoadingTransactions />
        ) : (
          <>
            {transactions.map((tx) => (
              tx.type === 'SWAP' ? (
                <SwapActivityItem 
                  key={tx.signature}
                  transaction={tx}
                />
              ) : (
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
              )
            ))}
          </>
        )}
      </div>
    </div>
  )
}
