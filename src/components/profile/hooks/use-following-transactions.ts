import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import type { Transaction } from '@/utils/helius/types'
import { useEffect, useState, useMemo } from 'react'
import type { GetFollowingResponse } from '../types'

// Helper to fetch transactions for a single wallet
async function fetchWalletTransactions(
  walletId: string
): Promise<Transaction[]> {
  const url = new URL('/api/transactions', window.location.origin)
  url.searchParams.set('address', walletId)
  url.searchParams.set('limit', '7') // Limit to 7 transactions per wallet

  // Always fetch all transaction types
  // No type filtering at API level

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
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [loadedWallets, setLoadedWallets] = useState<Set<string>>(new Set())
  const [totalWallets, setTotalWallets] = useState<number>(0)
  const [selectedType, setSelectedType] = useState<string>('all')
  const { walletAddress } = useCurrentWallet()

  // Fetch all transactions only when following or wallet changes
  useEffect(() => {
    setLoadedWallets(new Set())
    setTotalWallets(following?.profiles?.length ?? 0)

    if (!following?.profiles?.length) {
      setAllTransactions([])
      return
    }

    const fetchAllTransactions = async () => {
      setIsLoadingTransactions(true)
      setAllTransactions([]) // Clear current transactions while loading

      try {
        const walletIds = following.profiles
          .map((profile) => profile.wallet?.id)
          .filter((id): id is string => !!id)

        const transactionsByWallet: { [key: string]: Transaction[] } = {}

        // Fetch transactions for all wallets concurrently
        const fetchPromises = walletIds.map(async (walletId) => {
          // Always fetch all transaction types
          const transactions = await fetchWalletTransactions(walletId)
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

          setAllTransactions(allCurrentTransactions)
        })

        await Promise.all(fetchPromises)
      } catch (error) {
        console.error('Error aggregating transactions:', error)
      } finally {
        setIsLoadingTransactions(false)
      }
    }

    fetchAllTransactions()
  }, [following, walletAddress]) // Removed selectedType dependency

  // Filter transactions client-side based on selectedType
  const aggregatedTransactions = useMemo(() => {
    if (selectedType === 'all') {
      return allTransactions
    }
    
    // Client-side filtering based on type
    return allTransactions.filter(tx => {
      if (selectedType === 'compressed_nft_mint') {
        return tx.type === 'COMPRESSED_NFT_MINT'
      } 
      if (selectedType === 'swap') {
        return tx.type === 'SWAP'
      }
      if (selectedType === 'transfer') {
        return tx.type === 'TRANSFER'
      }
      return tx.type === selectedType.toUpperCase()
    })
  }, [allTransactions, selectedType])

  return {
    aggregatedTransactions,
    isLoadingTransactions,
    loadedWallets: loadedWallets.size,
    totalWallets,
    selectedType,
    setSelectedType,
  }
}