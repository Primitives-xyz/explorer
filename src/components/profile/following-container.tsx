import { useGetNamespaceProfiles } from '@/hooks/use-get-namespace-profiles'
import { IProfile } from '@/types/profile.types'
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core'
import { useMemo } from 'react'
import { FollowingTransactionFeed } from './following-transaction-feed'
import { useFollowingTransactions } from './hooks/use-following-transactions'
import { useGetFollowing } from './hooks/use-get-following'

interface ActivityFeedContainerProps {
  username: string
}

export const ActivityFeedContainer = ({
  username,
}: ActivityFeedContainerProps) => {
  const isLoggedIn = useIsLoggedIn()

  // following data
  const { following, loading } = useGetFollowing(username)

  const {
    aggregatedTransactions,
    isLoadingTransactions,
    loadedWallets,
    totalWallets,
    selectedType,
    setSelectedType,
  } = useFollowingTransactions(following)

  // kolscan data
  const { data: kolscanData, isLoading: kolscanLoading } =
    useGetNamespaceProfiles({
      name: 'kolscan',
    })

  // transform and memoize
  const kolscanTransactionsInput = useMemo(() => {
    return {
      page: kolscanData?.page || 1,
      pageSize: kolscanData?.pageSize || 10,
      profiles: kolscanData
        ? (kolscanData.profiles.flatMap((p) => ({
            ...p.profile,
            wallet: {
              id: p.wallet.address,
            },
          })) as IProfile[])
        : [],
    }
  }, [kolscanData])

  const {
    aggregatedTransactions: kolscanAggregatedTransactions,
    isLoadingTransactions: kolscanIsLoadingTransactions,
    loadedWallets: kolscanLoadedWallets,
    totalWallets: kolscanTotalWallets,
    selectedType: kolscanSelectedType,
    setSelectedType: kolscanSetSelectedType,
  } = useFollowingTransactions(kolscanTransactionsInput)

  return (
    <div className="space-y-4">
      <FollowingTransactionFeed
        transactions={aggregatedTransactions}
        isLoading={isLoadingTransactions || loading}
        isLoggedIn={isLoggedIn}
        loadedWallets={loadedWallets}
        totalWallets={totalWallets}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />
      <FollowingTransactionFeed
        title="Twitter KOLs"
        transactions={kolscanAggregatedTransactions}
        isLoading={kolscanIsLoadingTransactions || kolscanLoading}
        isLoggedIn={isLoggedIn}
        loadedWallets={kolscanLoadedWallets}
        totalWallets={kolscanTotalWallets}
        selectedType={kolscanSelectedType}
        setSelectedType={kolscanSetSelectedType}
      />
    </div>
  )
}
