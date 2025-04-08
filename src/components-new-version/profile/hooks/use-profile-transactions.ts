import { Transaction } from '@/components-new-version/models/helius.models'
import { isSpamTransaction } from '@/components-new-version/utils/transactions'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'

export const useProfileTransactions = ({
  walletAddress,
  hasSearched,
  itemsPerPage = 20,
}: {
  walletAddress: string
  hasSearched: boolean
  itemsPerPage?: number
}) => {
  const [transactionMap, setTransactionMap] = useState<
    Map<string, Transaction>
  >(new Map())
  const [newTransactions, setNewTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const t = useTranslations()

  const transactions = useMemo(() => {
    return Array.from(transactionMap.values()).sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
    )
  }, [transactionMap])

  const transactionTypes = useMemo(() => {
    const types = new Set(['all'])
    transactions.forEach((tx) => {
      if (!isSpamTransaction(tx) && tx.type) {
        types.add(tx.type.toLowerCase().replace('_', ' '))
      }
    })
    return Array.from(types)
  }, [transactions])

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
        url.searchParams.set('limit', itemsPerPage.toString())

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

        if (!Array.isArray(transactionsData) || transactionsData.length === 0) {
          if (page > 1) setPage((prev) => prev - 1)
          setIsLoading(false)
          return
        }

        if (page === 1) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, hasSearched, page])

  // Polling for new transactions
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, hasSearched, transactions, transactionMap])

  const handleLoadNewTransactions = () => {
    mergeTransactions(newTransactions)
    setNewTransactions([])
  }

  return {
    transactions,
    newTransactions,
    transactionTypes,
    isLoading,
    error,
    page,
    filteredTransactions: (type: string) =>
      type === 'all'
        ? transactions
        : transactions.filter(
            (tx) => tx.type?.toLowerCase().replace('_', ' ') === type
          ),
    setPage,
    handleLoadNewTransactions,
  }
}
