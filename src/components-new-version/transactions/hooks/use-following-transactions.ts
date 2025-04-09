import { FilterType } from '@/components-new-version/home/home-content/following-transactions/following-transactions'
import { Transaction } from '@/components-new-version/models/helius.models'
import {
  IGetProfilesResponse,
  IGetSocialResponse,
  IProfile,
} from '@/components-new-version/models/profiles.models'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { useEffect, useState } from 'react'

export type ITransactionWithProfile = Transaction & {
  profile?: IProfile
}

async function fetchWalletTransactions(
  walletId: string,
  type?: FilterType
): Promise<Transaction[]> {
  const url = new URL('/api/transactions', window.location.origin)
  url.searchParams.set('address', walletId)
  url.searchParams.set('limit', '7')

  if (type && type !== FilterType.ALL && type !== FilterType.KOL) {
    const apiType =
      type === FilterType.COMPRESSED_NFT_MINT
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

interface Props {
  following?: IGetSocialResponse
  kolData?: IGetProfilesResponse
}

export const useFollowingTransactions = ({ following, kolData }: Props) => {
  const [aggregatedTransactions, setAggregatedTransactions] = useState<
    ITransactionWithProfile[]
  >([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [loadedWallets, setLoadedWallets] = useState<Set<string>>(new Set())
  const [totalWallets, setTotalWallets] = useState<number>(0)
  const [selectedType, setSelectedType] = useState<FilterType>(FilterType.ALL)
  const { walletAddress } = useCurrentWallet()

  useEffect(() => {
    let isCancelled = false

    const fetchAllTransactions = async (data: { profiles: IProfile[] }) => {
      setIsLoadingTransactions(true)
      setAggregatedTransactions([])
      setLoadedWallets(new Set())

      try {
        const walletIdToProfileMap = new Map<string, IProfile>()

        data.profiles.forEach((profile) => {
          if (profile.wallet?.id) {
            walletIdToProfileMap.set(profile.wallet.id, profile)
          }
        })

        const walletIds = Array.from(walletIdToProfileMap.keys())

        const results = await Promise.all(
          walletIds.map(async (walletId) => {
            const profile = walletIdToProfileMap.get(walletId)
            const transactions = await fetchWalletTransactions(
              walletId,
              selectedType
            )

            if (isCancelled) return []

            setLoadedWallets((prev) => new Set([...prev, walletId]))

            return transactions.map((tx) => ({
              ...tx,
              profile,
            }))
          })
        )

        if (isCancelled) return

        const allTransactions = results
          .flat()
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )

        setAggregatedTransactions(allTransactions)
      } catch (error) {
        console.error('Error aggregating transactions:', error)
      } finally {
        if (!isCancelled) {
          setIsLoadingTransactions(false)
        }
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

    return () => {
      isCancelled = true
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
