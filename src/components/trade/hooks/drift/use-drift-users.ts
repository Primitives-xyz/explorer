import { useCurrentWallet } from '@/utils/use-current-wallet'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import { useInitializeDrift } from './use-initialize-drift'

export function useDriftUsers() {
  const [error, setError] = useState<string | null>(null)
  const { driftClient } = useInitializeDrift()
  const { walletAddress } = useCurrentWallet()
  const [accountIds, setAccountIds] = useState<number[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const getUserAccountIds = async () => {
    try {
      setLoading(true)

      if (!driftClient) {
        setError('Drift client not initialized')
        setAccountIds([])
        return
      }

      const userAccounts = await driftClient.getUserAccountsForAuthority(
        new PublicKey(walletAddress)
      )
      const userAccountIds = userAccounts.map(
        (userAccount) => userAccount.subAccountId
      )
      setAccountIds(userAccountIds)
    } catch (error) {
      console.error(error)
      setAccountIds([])
    } finally {
      setLoading(false)
    }
  }

  const refreshGetUserAccountIds = () => {
    getUserAccountIds()
  }

  useEffect(() => {
    getUserAccountIds()
  }, [walletAddress, driftClient])

  return {
    accountIds,
    error,
    loading,
    refreshGetUserAccountIds,
  }
}
