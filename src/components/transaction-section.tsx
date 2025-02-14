'use client'

import { DataContainer } from '@/components/common/data-container'
import { FilterBar } from '@/components/common/filter-bar'
import { FilterButton } from '@/components/common/filter-button'
import { ScrollableContent } from '@/components/common/scrollable-content'
import { TransactionCard } from '@/components/transactions/transaction-card'
import type { Transaction } from '@/utils/helius/types'
import { isSpamTransaction } from '@/utils/transaction'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'

interface TransactionSectionProps {
  walletAddress: string
  hasSearched?: boolean
}

export const TransactionSection = ({
  walletAddress,
  hasSearched,
}: TransactionSectionProps) => {
  // Use a Map to store unique transactions by signature
  const [transactionMap, setTransactionMap] = useState<
    Map<string, Transaction>
  >(new Map())
  const [newTransactions, setNewTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [selectedType, setSelectedType] = useState<string>('all')
  const ITEMS_PER_PAGE = 20

  const t = useTranslations()

  // Convert Map to sorted array for display
  const transactions = useMemo(() => {
    return Array.from(transactionMap.values()).sort((a, b) => {
      const timeA = a.timestamp || 0
      const timeB = b.timestamp || 0
      return timeB - timeA // Sort by timestamp, newest first
    })
  }, [transactionMap])

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

  // Helper function to merge transactions into the map
  const mergeTransactions = (newTxs: Transaction[]) => {
    setTransactionMap((prevMap) => {
      const updatedMap = new Map(prevMap)
      newTxs.forEach((tx) => {
        if (tx.signature && !isSpamTransaction(tx)) {
          updatedMap.set(tx.signature, tx)
        }
      })
      return updatedMap
    })
  }

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!walletAddress || !hasSearched) return

      setIsLoading(true)
      setError(null)

      try {
        const url = new URL('/api/transactions', window.location.origin)
        url.searchParams.set('address', walletAddress)
        url.searchParams.set('limit', ITEMS_PER_PAGE.toString())

        // For pagination, use the last transaction's signature
        if (page > 1 && transactions.length > 0) {
          const lastTransaction = transactions[transactions.length - 1]
          if (lastTransaction?.signature) {
            url.searchParams.set('before', lastTransaction.signature)
          }
        }

        const response = await fetch(url)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.error ||
              `${t('error.http_error_status')}: ${response.status}`
          )
        }

        const transactionsData = await response.json()
        if ('error' in transactionsData) throw new Error(transactionsData.error)

        // Handle empty response
        if (!Array.isArray(transactionsData) || transactionsData.length === 0) {
          if (page > 1) {
            setPage((prev) => prev - 1)
          }
          setIsLoading(false)
          return
        }

        if (page === 1) {
          // Reset the map for new searches
          setTransactionMap(new Map())
        }

        mergeTransactions(transactionsData)
      } catch (error) {
        console.error(t('error.error_fetching_transactions'), error)
        setError(
          error instanceof Error
            ? error.message
            : t('error.error_fetching_transactions')
        )
        if (page === 1) setTransactionMap(new Map())
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [walletAddress, hasSearched, page])

  // Add polling for new transactions
  useEffect(() => {
    if (!walletAddress || !hasSearched) return

    const checkNewTransactions = async () => {
      try {
        const url = new URL('/api/transactions', window.location.origin)
        url.searchParams.set('address', walletAddress)
        url.searchParams.set('limit', '50')

        if (transactions.length > 0 && transactions[0]?.signature) {
          url.searchParams.set('after', transactions[0].signature)
        }

        const response = await fetch(url)
        if (!response.ok)
          throw new Error(`${t('error.http_error_status')}: ${response.status}`)

        const newTxs = await response.json()
        if (Array.isArray(newTxs) && newTxs.length > 0) {
          // Filter out transactions we already have in newTransactions
          const existingNewSignatures = new Set(
            newTransactions.map((tx) => tx.signature)
          )
          const filteredNewTxs = newTxs.filter(
            (tx) =>
              !isSpamTransaction(tx) &&
              !transactionMap.has(tx.signature) &&
              !existingNewSignatures.has(tx.signature)
          )

          if (filteredNewTxs.length > 0) {
            setNewTransactions((prev) => [...filteredNewTxs, ...prev])
          }
        }
      } catch (error) {
        console.error(t('error.error_checking_for_new_transactions'), error)
      }
    }

    const interval = setInterval(checkNewTransactions, 8000)
    return () => clearInterval(interval)
  }, [walletAddress, hasSearched, transactions, transactionMap])

  const handleLoadNewTransactions = () => {
    mergeTransactions(newTransactions)
    setNewTransactions([])
  }

  if (!hasSearched) return null

  // Filter transactions by type
  const filteredTransactions = transactions.filter((tx) => {
    if (selectedType === 'all') return true
    return tx.type?.toLowerCase().replace('_', ' ') === selectedType
  })

  const getFilterLabel = (type: string, t: (key: string) => string) => {
    switch (type) {
      case 'all':
        return t('common.all')
      case 'unknown':
        return t('common.unknown')
      case 'transfer':
        return t('common.transfer')
      default:
        return type
    }
  }

  return (
    <DataContainer
      title={t('transaction_log.title')}
      count={filteredTransactions.length}
      error={error}
    >
      <FilterBar>
        {transactionTypes.map((type) => (
          <FilterButton
            key={type}
            label={getFilterLabel(type, t)}
            isSelected={selectedType === type}
            onClick={() => setSelectedType(type)}
          />
        ))}
      </FilterBar>

      {newTransactions.length > 0 && (
        <button
          onClick={handleLoadNewTransactions}
          className="w-full py-2 px-4 bg-green-500/10 hover:bg-green-500/20  font-mono border-y border-green-500/20 mb-2 relative group transition-all duration-300"
        >
          <div className="relative flex items-center gap-3">
            <span className=" animate-pulse">●</span>
            <span>
              {newTransactions.length} {t('transaction_log.new_transaction')}
              {newTransactions.length !== 1 ? 's' : ''} {t('common.available')}
            </span>
          </div>
        </button>
      )}

      <ScrollableContent
        isLoading={isLoading && filteredTransactions.length === 0}
        isEmpty={filteredTransactions.length === 0}
        loadingText={`>>> ${t('transaction_log.loading_transactions')}...`}
        emptyText={`>>> ${t('transaction_log.no_transactions_found')}`}
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
            <div className="p-4 text-center font-mono uppercase">
              {`>>> ${t('transaction_log.loading_more_transactions')}...`}
            </div>
          )}
        </div>
      </ScrollableContent>

      {!isLoading && transactions.length > 0 && (
        <button
          className="w-full p-1 text-xs  hover: font-mono border-t border-green-800 transition-colors duration-200"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={isLoading}
        >
          {isLoading ? `${t('common.loading')}...` : t('common.load_more')}
        </button>
      )}
    </DataContainer>
  )
}
