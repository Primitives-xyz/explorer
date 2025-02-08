import { useFollowStats } from './use-follow-stats'

interface WalletFollowStats {
  isFollowing: boolean
}

const fetchWalletFollowStats = async (url: string) => {
  console.log('🔍 Fetching wallet stats:', { url })
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error('❌ Error fetching wallet stats:', {
        status: response.status,
        statusText: response.statusText,
      })
      throw new Error('Failed to fetch wallet follow stats')
    }
    const data = await response.json()
    console.log('✅ Wallet stats response:', data)
    return data
  } catch (error) {
    console.error('❌ Exception in fetchWalletFollowStats:', error)
    throw error
  }
}

export function useWalletFollowStats(
  walletAddress: string,
  fromUsername: string | null,
) {
  console.log('🎣 useWalletFollowStats hook called:', {
    walletAddress,
    fromUsername,
  })

  const { stats, isLoading, error, mutate } = useFollowStats(
    walletAddress,
    fromUsername || '',
  )

  return {
    isFollowing: stats.isFollowing,
    isLoading,
    error,
    mutate,
  }
}
