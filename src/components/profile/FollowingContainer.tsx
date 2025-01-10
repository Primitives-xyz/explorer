import { useGetFollowing } from './hooks/use-get-following'
import { useFollowingTransactions } from './hooks/use-following-transactions'
import { FollowingProfileList } from './FollowingProfileList'
import { FollowingTransactionFeed } from './FollowingTransactionFeed'
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core'

interface ActivityFeedContainerProps {
  username: string
}

export const ActivityFeedContainer = ({
  username,
}: ActivityFeedContainerProps) => {
  const { following, loading, error } = useGetFollowing(username)
  const isLoggedIn = useIsLoggedIn()
  const { sdkHasLoaded } = useDynamicContext()
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
        sdkHasLoaded={sdkHasLoaded}
        isLoggedIn={isLoggedIn}
        loadedWallets={loadedWallets}
        totalWallets={totalWallets}
      />
    </div>
  )
}
