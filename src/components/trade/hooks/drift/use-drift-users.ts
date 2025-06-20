import { useCurrentWallet } from '@/utils/use-current-wallet'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import { useInitializeDrift } from './use-initialize-drift'

export function useDriftUsers() {
  const [error, setError] = useState<string | null>(null)
  const { driftClient, isInitializing: driftInitializing } =
    useInitializeDrift()
  const { walletAddress } = useCurrentWallet()
  const [accountIds, setAccountIds] = useState<number[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const getUserAccountIds = async () => {
      // Skip if no wallet or drift client not ready or already loading
      if (!walletAddress || !driftClient || loading) {
        return
      }

      try {
        setLoading(true)
        setError(null)

        const userAccounts = await driftClient.getUserAccountsForAuthority(
          new PublicKey(walletAddress)
        )
        const userAccountIds = userAccounts.map(
          (userAccount) => userAccount.subAccountId
        )
        setAccountIds(userAccountIds)
      } catch (error) {
        console.error('Error fetching user accounts:', error)
        setError('Failed to fetch user accounts')
        setAccountIds([])
      } finally {
        setLoading(false)
      }
    }

    getUserAccountIds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, driftClient])

  // Reset when wallet changes
  useEffect(() => {
    if (!walletAddress) {
      setAccountIds([])
      setError(null)
    }
  }, [walletAddress])

  const refreshGetUserAccountIds = () => {
    // Force a re-fetch by resetting loading state
    setLoading(false)
  }

  return {
    accountIds,
    error,
    loading: loading || driftInitializing,
    refreshGetUserAccountIds,
  }
}
