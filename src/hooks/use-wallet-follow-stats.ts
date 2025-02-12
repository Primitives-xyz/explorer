import { useFollowStats } from './use-follow-stats'

export function useWalletFollowStats(
  walletAddress: string,
  fromUsername: string | null
) {
  console.log('🎣 useWalletFollowStats hook called:', {
    walletAddress,
    fromUsername,
  })

  const { stats, isLoading, error, mutate } = useFollowStats(
    walletAddress,
    fromUsername || ''
  )

  return {
    isFollowing: stats.isFollowing,
    isLoading,
    error,
    mutate,
  }
}
