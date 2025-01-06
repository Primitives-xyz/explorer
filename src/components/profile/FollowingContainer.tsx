import { useFollowingFeed } from './hooks/use-following-feed'
import { FollowingProfileList } from './FollowingProfileList'
import { FollowingTransactionFeed } from './FollowingTransactionFeed'

interface FollowingContainerProps {
  username: string
}

export const FollowingContainer = ({ username }: FollowingContainerProps) => {
  const { following, transactions, loading, error } = useFollowingFeed(username)

  return (
    <div className="space-y-4">
      <FollowingTransactionFeed
        transactions={transactions}
        isLoading={loading}
      />
      {/* <FollowingProfileList
        profiles={following}
        loading={loading}
        error={error}
      /> */}
    </div>
  )
}
