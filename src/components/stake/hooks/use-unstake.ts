import { useStakeInfo } from '@/components/stake/hooks/use-stake-info'
import { useToast } from '@/components/ui/toast/hooks/use-toast'
import { useCurrentWallet } from '@/components/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export function useUnstake() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const t = useTranslations()
  const { refreshUserInfo } = useStakeInfo({})
  const { primaryWallet, walletAddress } = useCurrentWallet()

  const unstake = async () => {
    if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
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
        }),
      })

      const data = await response.json()
      const unStakeTx = data.unStakeTx
      const serializedBuffer: Buffer = Buffer.from(unStakeTx, 'base64')
      const vtx: VersionedTransaction = VersionedTransaction.deserialize(
        Uint8Array.from(serializedBuffer)
      )

      const signer = await primaryWallet.getSigner()
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')

      const simulate = await connection.simulateTransaction(vtx)
      console.log('sim:', simulate)

      const txid = await signer.signAndSendTransaction(vtx)

      const confirmToast = toast({
        title: t('trade.confirming_transaction'),
        description: t('trade.waiting_for_confirmation'),
        variant: 'pending',
        duration: 1000000000,
      })

      const confirmation = await connection.confirmTransaction({
        signature: txid.signature,
        ...(await connection.getLatestBlockhash()),
      })

      confirmToast.dismiss()

      if (confirmation.value.err) {
        toast({
          title: t('trade.transaction_failed'),
          description: t(
            'error.the_unstake_transaction_failed_please_try_again'
          ),
          variant: 'error',
          duration: 5000,
        })
      } else {
        toast({
          title: t('trade.transaction_successful'),
          description: t(
            'trade.the_unstake_transaction_was_successful_creating_shareable_link'
          ),
          variant: 'success',
          duration: 5000,
        })

        // Refresh user info after successful unstake
        refreshUserInfo()
      }
    } catch (err) {
      console.log('Error in making stake tx:', err)
      toast({
        title: t('trade.transaction_failed'),
        description: t('error.the_unstake_transaction_failed_please_try_again'),
        variant: 'error',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    unstake,
    isLoading,
  }
}
