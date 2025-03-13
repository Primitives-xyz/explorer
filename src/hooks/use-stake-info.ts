import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useEffect, useState } from 'react'

export function useStakeInfo({ wallet }: { wallet?: string }) {
  const [stakeAmount, setStakeAmount] = useState<string>('0')
  const [rewardsAmount, setRewardsAmount] = useState<string>('0')
  const [totalStakeAmount, setTotalStakeAmount] = useState<string>('0')
  const [showUserInfoLoading, setShowUserInfoLoading] = useState<boolean>(false)
  const [hasStaked, setHasStaked] = useState<boolean>(true)

  const { walletAddress: userWalletAddress } = useCurrentWallet()

  const walletAddress = wallet || userWalletAddress

  useEffect(() => {
    ;(async () => {
      try {
        if (walletAddress) {
          setShowUserInfoLoading(true)
          setHasStaked(true) // Reset hasStaked state on new wallet address

          const response = await fetch(`/api/unstake/userInfo`, {
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
              setStakeAmount('0')
              setRewardsAmount('0')
            } else {
              // Handle other types of errors
              console.error('API Error:', data.error)
              setStakeAmount('0')
              setRewardsAmount('0')
            }
          } else {
            // Process successful response
            const userInfo = data.userInfo
            setStakeAmount(userInfo.userDeposit)
            setRewardsAmount(Number(userInfo.rewards).toFixed(2))
            setHasStaked(true)

            // Set total stake amount with proper decimal places
            if (userInfo.totalDeposit) {
              setTotalStakeAmount(userInfo.totalDeposit.toString())
            }
          }

          setShowUserInfoLoading(false)
        }
      } catch (error) {
        console.error('Fetch error:', error)
        setStakeAmount('0')
        setRewardsAmount('0')
        setHasStaked(false)
        setShowUserInfoLoading(false)
      }
    })()
  }, [walletAddress])

  return {
    stakeAmount,
    setStakeAmount,
    rewardsAmount,
    setRewardsAmount,
    showUserInfoLoading,
    hasStaked,
    totalStakeAmount,
  }
}
