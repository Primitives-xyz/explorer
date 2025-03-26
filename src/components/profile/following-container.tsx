import { IProfile } from '@/components-new-version/models/profiles.models'
import { useGetNamespaceProfiles } from '@/hooks/use-get-namespace-profiles'
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
