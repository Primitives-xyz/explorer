import { useEffect, useState } from 'react'
import { Transaction } from '@/utils/helius/types'
import { GetFollowingResponse } from '../types'

// Helper to fetch transactions for a single wallet
async function fetchWalletTransactions(
  walletId: string,
): Promise<Transaction[]> {
  const url = new URL('/api/transactions', window.location.origin)
  url.searchParams.set('address', walletId)

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch transactions')
    const data = await response.json()
    return data.map((tx: Transaction) => ({
      ...tx,
      sourceWallet: walletId, // Add source wallet for tracking
    }))
  } catch (error) {
    console.error(`Error fetching transactions for ${walletId}:`, error)
    return []
  }
}

export const useFollowingTransactions = (
  following: GetFollowingResponse | undefined,
) => {
  const [aggregatedTransactions, setAggregatedTransactions] = useState<
    Transaction[]
  >([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)

  useEffect(() => {
    if (!following?.profiles?.length) {
      setAggregatedTransactions([])
      return
    }

    const fetchAllTransactions = async () => {
      setIsLoadingTransactions(true)

      try {
        // Get wallet IDs, filtering out undefined/null values
        const walletIds = following.profiles
          .map((profile) => profile.wallet?.id)
          .filter((id): id is string => !!id)

        // Fetch transactions for all wallets concurrently
        const transactionArrays = await Promise.all(
          walletIds.map(fetchWalletTransactions),
        )

        // Flatten and sort by timestamp
        const allTransactions = transactionArrays
          .flat()
          .sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime()
            const timeB = new Date(b.timestamp).getTime()
            return timeB - timeA
          })
          .slice(0, 50) // Limit to most recent 50 transactions

        setAggregatedTransactions(allTransactions)
      } catch (error) {
        console.error('Error aggregating transactions:', error)
      } finally {
        setIsLoadingTransactions(false)
      }
    }

    fetchAllTransactions()
  }, [following])

  return { aggregatedTransactions, isLoadingTransactions }
}
