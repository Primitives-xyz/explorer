'use client'

import { Transaction } from '@/utils/helius/types'
import { useEffect, useState, useMemo } from 'react'
import { TransactionCard } from './transactions/TransactionCard'
import { isSpamTransaction } from '@/utils/transaction'
import { DataContainer } from './common/DataContainer'
import { ScrollableContent } from './common/ScrollableContent'
import { FilterBar } from './common/FilterBar'
import { FilterButton } from './common/FilterButton'

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
  const [selectedType, setSelectedType] = useState<string>('all')
  const ITEMS_PER_PAGE = 5

  // Get unique transaction types from the results
  const transactionTypes = useMemo(() => {
    const types = new Set(['all'])
    transactions.forEach((tx) => {
      if (!isSpamTransaction(tx) && tx.type) {
        types.add(tx.type.toLowerCase().replace('_', ' '))
      }
    })
    return Array.from(types)
  }, [transactions])

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

  // Filter transactions by type and spam
  const filteredTransactions = transactions.filter((tx) => {
    if (isSpamTransaction(tx)) return false
    if (selectedType === 'all') return true
    return tx.type?.toLowerCase().replace('_', ' ') === selectedType
  })

  return (
    <DataContainer
      title="transaction_log.sol"
      count={filteredTransactions.length}
      error={error}
    >
      <FilterBar>
        {transactionTypes.map((type) => (
          <FilterButton
            key={type}
            label={type === 'all' ? 'All' : type}
            isSelected={selectedType === type}
            onClick={() => setSelectedType(type)}
          />
        ))}
      </FilterBar>

      <ScrollableContent
        isLoading={isLoading && filteredTransactions.length === 0}
        isEmpty={filteredTransactions.length === 0}
        loadingText=">>> LOADING TRANSACTIONS..."
        emptyText=">>> NO TRANSACTIONS FOUND"
      >
        <div className="divide-y divide-green-800/30">
          {filteredTransactions.map((tx) => (
            <TransactionCard
              key={tx.signature}
              transaction={tx}
              sourceWallet={walletAddress}
            />
          ))}
          {isLoading && page > 1 && (
            <div className="p-4 text-center text-green-600 font-mono">
              {'>>> LOADING MORE TRANSACTIONS...'}
            </div>
          )}
        </div>
      </ScrollableContent>

      {!isLoading && transactions.length > 0 && (
        <button
          className="w-full p-1 text-xs text-green-600 hover:text-green-500 font-mono border-t border-green-800 transition-colors duration-200"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </DataContainer>
  )
}
