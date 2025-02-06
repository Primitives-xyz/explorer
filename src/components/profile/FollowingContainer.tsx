import { useGetFollowing } from './hooks/use-get-following'
import { useFollowingTransactions } from './hooks/use-following-transactions'
import { FollowingTransactionFeed } from './FollowingTransactionFeed'
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core'

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
  } = useFollowingTransactions(following)

  return (
    <div className="space-y-4">
      <FollowingTransactionFeed
        transactions={aggregatedTransactions}
        isLoading={isLoadingTransactions || loading}
        isLoggedIn={isLoggedIn}
        loadedWallets={loadedWallets}
        totalWallets={totalWallets}
      />
    </div>
  )
}
