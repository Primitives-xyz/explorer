import { useGetNamespaceProfiles } from '@/hooks/use-get-namespace-profiles'
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core'
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

  const {
    aggregatedTransactions: kolscanAggregatedTransactions,
    isLoadingTransactions: kolscanIsLoadingTransactions,
    loadedWallets: kolscanLoadedWallets,
    totalWallets: kolscanTotalWallets,
    selectedType: kolscanSelectedType,
    setSelectedType: kolscanSetSelectedType,
  } = useFollowingTransactions(kolscanData)

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
        title="KOLScan"
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
