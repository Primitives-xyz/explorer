import { useCallback, useEffect, useState } from 'react'

export interface Transaction {
  id?: number
  inputAmount: number
  outputAmount: number
  inputValueSOL: number
  outputValueSOL: number
  inputValueUSD?: number
  outputValueUSD?: number
  solPrice?: number
  profileId?: string
  source?: string
  slippage?: number
  priorityFee?: number
  sourceWallet?: string
  sourceTransactionId?: string
  transactionSignature?: string
  inputMint: string
  outputMint: string
  tradeType?: 'buy' | 'sell' | 'swap'
  timestamp?: number
  platform?: 'trenches' | 'main'
  walletAddress?: string
  createdAt?: string
  updatedAt?: string
}

export interface TransactionMeta {
  total: number
  hasMore: boolean
  oldestTimestamp?: number
  newestTimestamp?: number
}

export interface TransactionHistoryResponse {
  data: Transaction[]
  meta: TransactionMeta
}

export interface UseTapestryTransactionHistoryOptions {
  enabled?: boolean
  since?: number // Unix timestamp
  until?: number // Unix timestamp
  limit?: number
  sortOrder?: 'asc' | 'desc'
}

export function useTapestryTransactionHistory(
  walletAddress: string,
  options: UseTapestryTransactionHistoryOptions | boolean = {}
) {
  // Handle backwards compatibility with boolean enabled param
  const normalizedOptions =
    typeof options === 'boolean' ? { enabled: options } : options

  const {
    enabled = true,
    since,
    until,
    limit = 100,
    sortOrder = 'desc',
  } = normalizedOptions

  const [transactions, setTransactions] = useState<Transaction[] | undefined>(
    undefined
  )
  const [meta, setMeta] = useState<TransactionMeta | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState<Error | null>(null)
  const [hasFetched, setHasFetched] = useState(false)

  const fetchTransactions = useCallback(
    async (
      fetchSince?: number,
      fetchUntil?: number,
      append: boolean = false
    ) => {
      // Only fetch if we have a valid wallet address
      if (!enabled || !walletAddress || walletAddress.length <= 32) {
        return
      }

      setIsLoading(true)
      setIsError(null)

      try {
        const params = new URLSearchParams({
          walletAddress,
          limit: limit.toString(),
          sortOrder,
        })

        if (fetchSince) params.append('since', fetchSince.toString())
        if (fetchUntil) params.append('until', fetchUntil.toString())

        const url = `/api/trades/fetch-transaction-history?${params.toString()}`

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: TransactionHistoryResponse = await response.json()

        if (append) {
          // Use functional update to avoid transactions dependency
          setTransactions((prev) => [...(prev || []), ...data.data])
        } else {
          // Replace transactions
          setTransactions(data.data)
        }

        setMeta(data.meta)
        setHasFetched(true)
      } catch (error) {
        console.error('❌ Error fetching transaction history:', error)
        setIsError(error instanceof Error ? error : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    },
    [enabled, walletAddress, limit, sortOrder]
  )

  // Initial fetch when dependencies change
  useEffect(() => {
    // Skip if we already have data and nothing important changed
    if (hasFetched && transactions && transactions.length > 0) {
      return
    }

    setHasFetched(false)
    setTransactions(undefined)
    setMeta(undefined)
    setIsError(null)

    if (enabled && walletAddress && walletAddress.length > 32) {
      fetchTransactions(since, until)
    }
  }, [
    enabled,
    walletAddress,
    since,
    until,
    fetchTransactions,
    hasFetched,
    transactions,
  ])

  // Reset when wallet changes
  useEffect(() => {
    setHasFetched(false)
    setTransactions(undefined)
    setMeta(undefined)
    setIsError(null)
  }, [walletAddress])

  const refetch = useCallback(() => {
    if (enabled && walletAddress && walletAddress.length > 32) {
      fetchTransactions(since, until)
    }
  }, [enabled, walletAddress, since, until, fetchTransactions])

  const loadMore = useCallback(() => {
    if (meta?.hasMore && meta.oldestTimestamp && !isLoading) {
      // Fetch older transactions
      fetchTransactions(undefined, meta.oldestTimestamp, true)
    }
  }, [meta, isLoading, fetchTransactions])

  const loadNewer = useCallback(() => {
    if (meta?.newestTimestamp && !isLoading) {
      // Fetch newer transactions
      fetchTransactions(meta.newestTimestamp, undefined)
    }
  }, [meta, isLoading, fetchTransactions])

  return {
    transactions,
    meta,
    isLoading,
    isError,
    refetch,
    loadMore,
    loadNewer,
    hasMore: meta?.hasMore || false,
  }
}
