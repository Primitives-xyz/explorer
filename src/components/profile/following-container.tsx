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
  const { following, loading } = useGetFollowing(username)

  const isLoggedIn = useIsLoggedIn()
  const {
    aggregatedTransactions,
    isLoadingTransactions,
    loadedWallets,
    totalWallets,
    selectedType,
    setSelectedType,
  } = useFollowingTransactions(following)

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
    </div>
  )
}
