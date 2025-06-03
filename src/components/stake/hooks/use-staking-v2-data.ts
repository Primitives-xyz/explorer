import useSWR from 'swr'

interface StakingV2Data {
  totalTransactions: number
  creditsEarned: number
  overClaimed?: number
  finalCredits: number
  currentStake: number
  totalStaked: number
  totalUnstaked: number
  totalRewardsClaimed: number
  fairRewards: number
  fairRewardsTokens: number
  actualClaimed: number
  actualClaimedTokens: number
  status: 'over-claimed' | 'under-claimed' | 'correctly-claimed'
  details?: {
    stakingHistory: Array<{
      date: string
      amount: number
      type: 'stake' | 'unstake' | 'reward'
    }>
    claimedAmount: number
    actualEarnings: number
  }
}

export function useStakingV2Data(walletAddress: string | null) {
  const fetcher = async (url: string) => {
    const response = await fetch(url)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch staking data')
    }

    return response.json()
  }

  const { data, error, isLoading, mutate } = useSWR(
    walletAddress ? `/api/staking-v2/${walletAddress}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // Retry a few times in case of failures
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  )

  return {
    data,
    error,
    isLoading,
    refetch: mutate,
  }
}
