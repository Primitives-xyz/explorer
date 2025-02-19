import { useFollowStats } from './use-follow-stats'

export function useWalletFollowStats(
  walletAddress: string | null,
  fromUsername: string | null
) {
  const { stats, isLoading, error, mutate } = useFollowStats(
    walletAddress || '',
    fromUsername
  )

  return {
    isFollowing: stats.isFollowing,
    isLoading,
    error,
    mutate,
  }
}
