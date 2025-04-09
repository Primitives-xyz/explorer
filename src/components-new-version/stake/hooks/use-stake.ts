import { useStakeInfo } from '@/components-new-version/stake/hooks/use-stake-info'
import { useToast } from '@/components-new-version/ui/toast/hooks/use-toast'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export function useStake() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const t = useTranslations()
  const { refreshUserInfo } = useStakeInfo({})

  const { primaryWallet, walletAddress } = useCurrentWallet()

  const stake = async (amount: string) => {
    if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch('/api/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, walletAddy: walletAddress }),
      })

      const data = await response.json()
      const serializedBuffer = Buffer.from(data.stakeTx, 'base64')
      const vtx = VersionedTransaction.deserialize(
        Uint8Array.from(serializedBuffer)
      )

      if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
        throw new Error('Wallet not connected')
      }

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
          description: t('trade.the_stake_transaction_failed_please_try_again'),
          variant: 'error',
          duration: 5000,
        })
      } else {
        toast({
          title: t('trade.transaction_successful'),
          description: t(
            'trade.the_stake_transaction_was_successful_creating_shareable_link'
          ),
          variant: 'success',
          duration: 5000,
        })
        refreshUserInfo()
      }
    } catch (err) {
      console.error('Stake error:', err)
      toast({
        title: t('trade.transaction_failed'),
        description: t('trade.the_stake_transaction_failed_please_try_again'),
        variant: 'error',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    stake,
    isLoading,
  }
}
