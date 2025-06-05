import { useCreateUnstakeContentNode } from '@/components/stake/hooks/use-create-unstake-content'
import { useStakeInfo } from '@/components/stake/hooks/use-stake-info'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { useMigrationCheck } from './use-migration-check'

export function useUnstake() {
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations()
  const { refreshUserInfo } = useStakeInfo({})
  const { createContentNode } = useCreateUnstakeContentNode()
  const { needsMigration } = useMigrationCheck()
  const { primaryWallet, walletAddress } = useCurrentWallet()

  const unstake = async (amount: string) => {
    if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
      return
    }

    // Check if migration is needed before unstaking
    if (needsMigration) {
      toast.error(t('stake.migration_required'), {
        description: t('stake.migration_required_description'),
      })
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch(`/api/unstake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddy: walletAddress,
          amount,
        }),
      })

      const data = await response.json()
      const unStakeTx = data.unStakeTx
      const serializedBuffer: Buffer = Buffer.from(unStakeTx, 'base64')
      let vtx: VersionedTransaction = VersionedTransaction.deserialize(
        Uint8Array.from(serializedBuffer)
      )

      const signer = await primaryWallet.getSigner()
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')

      const simulate = await connection.simulateTransaction(vtx, {
        sigVerify: false,
      })
      console.log('sim:', simulate)

      vtx = await signer.signTransaction(vtx)
      const txid = await connection.sendRawTransaction(vtx.serialize())

      const confirmToastId = toast.loading(t('trade.confirming_transaction'), {
        description: t('trade.waiting_for_confirmation'),
        duration: 1000000000,
      })

      const confirmation = await connection.confirmTransaction({
        signature: txid,
        ...(await connection.getLatestBlockhash()),
      })

      toast.dismiss(confirmToastId)

      if (confirmation.value.err) {
        toast.error(t('trade.transaction_failed'), {
          description: t(
            'error.the_unstake_transaction_failed_please_try_again'
          ),
        })
      } else {
        toast.success(t('trade.transaction_successful'), {
          description: t(
            'trade.the_unstake_transaction_was_successful_creating_shareable_link'
          ),
        })

        // Refresh user info after successful unstake
        refreshUserInfo()

        // Create content node for the unstake transaction
        await createContentNode({
          signature: txid,
          unstakeAmount: amount,
          walletAddress,
          route: 'stake',
        })
      }
    } catch (err) {
      console.log('Error in making stake tx:', err)
      toast.error(t('trade.transaction_failed'), {
        description: t('error.the_unstake_transaction_failed_please_try_again'),
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    unstake,
    isLoading,
    needsMigration,
  }
}
