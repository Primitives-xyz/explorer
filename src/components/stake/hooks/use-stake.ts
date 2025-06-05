import { useCreateStakeContentNode } from '@/components/stake/hooks/use-create-stake-content'
import { useStakeInfo } from '@/components/stake/hooks/use-stake-info'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { VersionedTransaction } from '@solana/web3.js'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { useMigrationCheck } from './use-migration-check'

export function useStake() {
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations('stake')
  const { refreshUserInfo } = useStakeInfo({})
  const { createContentNode } = useCreateStakeContentNode()
  const { needsMigration } = useMigrationCheck()

  const { primaryWallet, walletAddress } = useCurrentWallet()

  const stake = async (amount: string) => {
    if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
      return
    }

    // Check if migration is needed before staking
    if (needsMigration) {
      toast.error(t('migration_required'), {
        description: t('migration_required_description'),
      })
      return
    }

    try {
      setIsLoading(true)

      // Step 1: Get unsigned transaction from backend
      const getResponse = await fetch(
        `/api/stake?amount=${amount}&walletAddress=${walletAddress}`
      )

      const data = await getResponse.json()
      const serializedBuffer = Buffer.from(data.stakeTx, 'base64')
      let vtx = VersionedTransaction.deserialize(
        Uint8Array.from(serializedBuffer)
      )

      if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
        throw new Error('Wallet not connected')
      }

      // Step 2: Sign transaction on frontend
      const signer = await primaryWallet.getSigner()
      vtx = await signer.signTransaction(vtx)

      // Step 3: Send signed transaction to backend for execution
      const signedTxBuffer = Buffer.from(vtx.serialize())
      const signedTransactionBase64 = signedTxBuffer.toString('base64')

      const confirmToastId = toast(t('transaction.confirming'), {
        description: t('transaction.waiting_confirmation'),
        duration: 1000000000,
      })

      const executeResponse = await fetch('/api/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signedTransaction: signedTransactionBase64,
        }),
      })

      const executeData = await executeResponse.json()
      toast.dismiss(confirmToastId)

      if (!executeData.confirmed || executeData.confirmationError) {
        toast.error(t('transaction.failed'), {
          description: t('transaction.stake_failed_try_again'),
        })
        console.error(
          'Stake transaction failed:',
          executeData.confirmationError
        )
      } else {
        toast.success(t('transaction.successful'), {
          description: t('transaction.stake_successful'),
        })
        refreshUserInfo()

        // Create content node for the stake transaction
        await createContentNode({
          signature: executeData.txid,
          stakeAmount: amount,
          walletAddress,
          route: 'stake',
        })
      }
    } catch (err) {
      console.error('Stake error:', err)
      toast.error(t('transaction.failed'), {
        description: t('transaction.stake_failed_try_again'),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    stake,
    isLoading,
    needsMigration,
  }
}
