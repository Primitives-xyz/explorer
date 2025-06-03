import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'

// Define the complete UserInfo interface based on our enhanced API response
export interface UserInfo {
  userDeposit: string
  rewards: string
  totalDeposit: string
  rawDeposit: string
  rawDebt: string
  lastUpdate: string
  initialized: number
  totalRate: string
  rewardMultiplier: string
  lastRewardTime: string
  systemType: 'Sustainable' | 'Legacy' | 'Unknown'
  effectiveRewardRate: string
  earningRates: {
    perSecond: string
    perHour: string
    perDay: string
    canEarnRewards: boolean
  }
  userSharePercentage: string
  isNewVersion: boolean
  currentRewardRate?: string
  distributionPeriod?: string
  emergencyReserveBp?: string
  times?: number
  claimPeriod?: string
}

export function useStakeInfo({ wallet }: { wallet?: string }) {
  const [hasStaked, setHasStaked] = useState<boolean>(true)
  const { walletAddress: userWalletAddress } = useCurrentWallet()
  const walletAddress = wallet || userWalletAddress

  // Create a unique key for SWR based on the wallet address
  const swrKey = walletAddress
    ? `/api/staking/user-info/${walletAddress}`
    : null

  // Fetcher function for SWR
  const fetcher = async (url: string) => {
    const response = await fetch('/api/staking/user-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: walletAddress,
      }),
    })

    const data = await response.json()

    // Check if the response contains an error
    if (data.error) {
      // Handle the specific error for accounts that haven't staked yet
      if (data.error.includes('Account does not exist')) {
        setHasStaked(false)
        return {
          userDeposit: '0',
          rewards: '0',
          totalDeposit: '0',
          rawDeposit: '0',
          rawDebt: '0',
          lastUpdate: '0',
          initialized: 0,
          totalRate: '0',
          rewardMultiplier: '0',
          lastRewardTime: '0',
          systemType: 'Unknown',
          effectiveRewardRate: '0',
          earningRates: {
            perSecond: '0',
            perHour: '0',
            perDay: '0',
            canEarnRewards: false,
          },
          userSharePercentage: '0',
          isNewVersion: false,
        } as UserInfo
      } else {
        // Handle other types of errors
        console.error('API Error:', data.error)
        throw new Error(data.error)
      }
    } else {
      // Process successful response
      setHasStaked(true)
      return data.userInfo as UserInfo
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
    // Original basic fields for backward compatibility
    stakeAmount: userInfo?.userDeposit || '0',
    rewardsAmount: userInfo?.rewards?.toString() || '0',
    totalStakeAmount: userInfo?.totalDeposit?.toString() || '0',
    showUserInfoLoading: isLoading,
    hasStaked,
    refreshUserInfo,
    hasMigrated: true, // Always true now since API handles both versions

    // Enhanced fields - expose all the rich data
    userInfo: userInfo || null,
    systemType: userInfo?.systemType || 'Unknown',
    effectiveRewardRate: userInfo?.effectiveRewardRate || '0',
    earningRates: userInfo?.earningRates || {
      perSecond: '0',
      perHour: '0',
      perDay: '0',
      canEarnRewards: false,
    },
    userSharePercentage: userInfo?.userSharePercentage || '0',
    isNewVersion: userInfo?.isNewVersion || false,
    canEarnRewards: userInfo?.earningRates?.canEarnRewards || false,

    // System status info
    currentRewardRate: userInfo?.currentRewardRate || '0',
    distributionPeriod: userInfo?.distributionPeriod || '0',
    emergencyReserveBp: userInfo?.emergencyReserveBp || '0',

    // Raw data for advanced users
    rawDeposit: userInfo?.rawDeposit || '0',
    rawDebt: userInfo?.rawDebt || '0',
    lastUpdate: userInfo?.lastUpdate || '0',
  }
}
