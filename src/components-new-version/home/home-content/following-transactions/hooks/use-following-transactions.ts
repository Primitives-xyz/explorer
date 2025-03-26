import { FilterType } from '@/components-new-version/home/home-content/following-transactions/filters-button'
import { Transaction } from '@/components-new-version/models/helius.models'
import {
  IGetProfilesResponse,
  IGetSocialResponse,
  IProfile,
} from '@/components-new-version/models/profiles.models'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { useEffect, useState } from 'react'

async function fetchWalletTransactions(
  walletId: string,
  type?: string
): Promise<Transaction[]> {
  const url = new URL('/api/transactions', window.location.origin)
  url.searchParams.set('address', walletId)
  url.searchParams.set('limit', '7')

  if (type && type !== 'all' && type !== 'kol') {
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

export const useFollowingTransactions = ({
  following,
  kolData,
}: {
  following?: IGetSocialResponse
  kolData?: IGetProfilesResponse
}) => {
  const [aggregatedTransactions, setAggregatedTransactions] = useState<
    Transaction[]
  >([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [loadedWallets, setLoadedWallets] = useState<Set<string>>(new Set())
  const [totalWallets, setTotalWallets] = useState<number>(0)
  const [selectedType, setSelectedType] = useState<FilterType>(FilterType.ALL)
  const { walletAddress } = useCurrentWallet()

  useEffect(() => {
    setLoadedWallets(new Set())

    const fetchAllTransactions = async (data: IGetSocialResponse) => {
      setIsLoadingTransactions(true)
      setAggregatedTransactions([]) // Clear current transactions while loading

      try {
        const walletIds = data.profiles
          .map((profile) => profile.wallet?.id)
          .filter((id): id is string => !!id)

        const transactionsByWallet: { [key: string]: Transaction[] } = {}

        // Fetch transactions for all wallets concurrently
        await Promise.all(
          walletIds.map(async (walletId) => {
            const transactions = await fetchWalletTransactions(
              walletId,
              selectedType
            )

            transactionsByWallet[walletId] = transactions
            setLoadedWallets((prev) => new Set([...Array.from(prev), walletId]))

            // Update UI with current progress
            const currentTransactions = Object.values(transactionsByWallet)
              .flat()
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              )

            setAggregatedTransactions(currentTransactions)
          })
        )
      } catch (error) {
        console.error('Error aggregating transactions:', error)
      } finally {
        setIsLoadingTransactions(false)
      }
    }

    if (selectedType !== FilterType.KOL) {
      setTotalWallets(following?.profiles?.length ?? 0)

      if (!following?.profiles?.length) {
        setAggregatedTransactions([])
        return
      }

      fetchAllTransactions(following)
    } else {
      const kolTransactionInput = {
        page: kolData?.page || 1,
        pageSize: kolData?.pageSize || 10,
        profiles: kolData
          ? (kolData.profiles.flatMap((p) => ({
              ...p.profile,
              wallet: {
                id: p.wallet.address,
              },
            })) as IProfile[])
          : [],
      }

      setTotalWallets(kolTransactionInput?.profiles?.length ?? 0)

      if (!kolTransactionInput?.profiles?.length) {
        setAggregatedTransactions([])
        return
      }

      fetchAllTransactions(kolTransactionInput)
    }
  }, [following, kolData, walletAddress, selectedType])

  return {
    aggregatedTransactions,
    isLoadingTransactions,
    loadedWallets: loadedWallets.size,
    totalWallets,
    selectedType,
    setSelectedType,
  }
}
