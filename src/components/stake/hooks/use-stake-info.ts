import { useCurrentWallet } from '@/components/utils/use-current-wallet'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'

export function useStakeInfo({ wallet }: { wallet?: string }) {
  const [hasStaked, setHasStaked] = useState<boolean>(true)

  const { walletAddress: userWalletAddress } = useCurrentWallet()

  const walletAddress = wallet || userWalletAddress

  // Create a unique key for SWR based on the wallet address
  const swrKey = walletAddress ? `/api/unstake/userInfo/${walletAddress}` : null

  // Fetcher function for SWR
  const fetcher = async (url: string) => {
    const response = await fetch('/api/unstake/userInfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddy: walletAddress,
      }),
    })

    const data = await response.json()

    // Check if the response contains an error
    if (data.error) {
      // Handle the specific error for accounts that haven't staked yet
      if (data.error.includes('Account does not exist or has no data')) {
        setHasStaked(false)
        return {
          userDeposit: '0',
          rewards: '0',
          totalDeposit: '0',
        }
      } else {
        // Handle other types of errors
        console.error('API Error:', data.error)
        throw new Error(data.error)
      }
    } else {
      // Process successful response
      setHasStaked(true)
      return data.userInfo
    }
  }

  // Use SWR to fetch and cache the data
  const {
    data: userInfo,
    error,
    isLoading,
  } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 10000, // 10 seconds
  })

  // Helper function to trigger a revalidation
  const refreshUserInfo = () => {
    if (swrKey) {
      return mutate(swrKey)
    }
  }

  return {
    stakeAmount: userInfo?.userDeposit || '0',
    rewardsAmount: userInfo?.rewards
      ? Number(userInfo.rewards).toFixed(2)
      : '0',
    totalStakeAmount: userInfo?.totalDeposit?.toString() || '0',
    showUserInfoLoading: isLoading,
    hasStaked,
    refreshUserInfo,
  }
}
