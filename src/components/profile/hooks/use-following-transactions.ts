import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import type { Transaction } from '@/utils/helius/types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { GetFollowingResponse } from '../types'

// Helper to fetch transactions for a single wallet
async function fetchWalletTransactions(
  walletId: string,
  type?: string
): Promise<Transaction[]> {
  const url = new URL('/api/transactions', window.location.origin)
  url.searchParams.set('address', walletId)
  url.searchParams.set('limit', '7') // Limit to 7 transactions per wallet

  // Map the UI type to the Helius API type (only if not 'all')
  if (type && type !== 'all') {
    const apiType =
      type === 'compressed_nft_mint'
        ? 'COMPRESSED_NFT_MINT'
        : type.toUpperCase()
    url.searchParams.set('type', apiType)
  }

  try {
    const response = await fetch(url)
    if (!response.ok) {
      return []
    }
    const data = await response.json()
    return data.map((tx: Transaction) => ({
      ...tx,
      sourceWallet: walletId,
    }))
  } catch (error) {
    console.error(`Error fetching transactions for ${walletId}:`, error)
    return []
  }
}

export const useFollowingTransactions = (
  following: GetFollowingResponse | undefined
) => {
  const [aggregatedTransactions, setAggregatedTransactions] = useState<
    Transaction[]
  >([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [loadedWallets, setLoadedWallets] = useState<Set<string>>(new Set())
  const [totalWallets, setTotalWallets] = useState<number>(0)
  const [selectedType, setSelectedType] = useState<string>('all')
  const { walletAddress } = useCurrentWallet()

  // Memoize the wallet IDs to prevent unnecessary re-renders
  const walletIds = useMemo(() => {
    if (!following?.profiles?.length) return []
    return following.profiles
      .map((profile) => profile.wallet?.id)
      .filter((id): id is string => !!id)
  }, [following?.profiles])

  // Memoize the fetchAllTransactions function
  const fetchAllTransactions = useCallback(async () => {
    if (!walletIds.length) {
      setAggregatedTransactions([])
      return
    }

    setIsLoadingTransactions(true)
    setAggregatedTransactions([]) // Clear current transactions while loading

    try {
      const transactionsByWallet: { [key: string]: Transaction[] } = {}

      // Fetch transactions for all wallets concurrently
      const fetchPromises = walletIds.map(async (walletId) => {
        const transactions = await fetchWalletTransactions(
          walletId,
          selectedType
        )
        transactionsByWallet[walletId] = transactions
        setLoadedWallets((prev) => new Set([...Array.from(prev), walletId]))

        // Update aggregated transactions whenever we get new data
        const allCurrentTransactions = Object.values(transactionsByWallet)
          .flat()
          .sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime()
            const timeB = new Date(b.timestamp).getTime()
            return timeB - timeA
          })
          .slice(0, 50)

        setAggregatedTransactions(allCurrentTransactions)
      })

      await Promise.all(fetchPromises)
    } catch (error) {
      console.error('Error aggregating transactions:', error)
    } finally {
      setIsLoadingTransactions(false)
    }
  }, [walletIds, selectedType])

  useEffect(() => {
    setLoadedWallets(new Set())
    setTotalWallets(following?.profiles?.length ?? 0)

    // Only fetch if we have wallet IDs
    if (walletIds.length > 0) {
      fetchAllTransactions()
    }
  }, [walletIds.length, fetchAllTransactions])

  return {
    aggregatedTransactions,
    isLoadingTransactions,
    loadedWallets: loadedWallets.size,
    totalWallets,
    selectedType,
    setSelectedType,
  }
}
