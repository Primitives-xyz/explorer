import { isSolanaWallet } from '@dynamic-labs/solana'
import { useEffect, useState } from 'react'
import { useInitializeDrift } from './use-initialize-drift'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { PublicKey } from '@solana/web3.js'

export function useDriftUsers() {
  const [error, setError] = useState<string | null>(null)
  const { driftClient } = useInitializeDrift()
  const { primaryWallet, walletAddress } = useCurrentWallet()
  const [accountIds, setAccountIds] = useState<number[]>([])

  useEffect(() => {
    if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
      setError('Wallet not connected')
      return
    }

    if (!driftClient) {
      setError('Drift client not initialized')
      return
    }

    const getUserAccountIds = async () => {
      try {
        const userAccounts = await driftClient.getUserAccountsForAuthority(new PublicKey(walletAddress))
        const userAccountIds = userAccounts.map((userAccount) => userAccount.subAccountId)
        setAccountIds(userAccountIds)
      } catch (error) {
        setAccountIds([])
      }
    }

    getUserAccountIds()

  }, [primaryWallet, walletAddress, driftClient])

  return {
    accountIds,
    error,
  }
}