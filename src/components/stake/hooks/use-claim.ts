import { useStakeInfo } from '@/components/stake/hooks/use-stake-info'
import { useToast } from '@/components/ui/toast/hooks/use-toast'
import { useCurrentWallet } from '@/components/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  rewardsAmount: string
}

export function useClaimRewards({ rewardsAmount }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const { toast } = useToast()
  const t = useTranslations()
  const { refreshUserInfo } = useStakeInfo({})
  const { primaryWallet, walletAddress } = useCurrentWallet()

  const hasRewards = rewardsAmount && parseFloat(rewardsAmount) > 0

  const claimRewards = async () => {
    router.refresh()
    if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
      return
    }

    if (!hasRewards) {
      toast({
        title: t('trade.transaction_failed'),
        description: t('trade.no_rewards_to_claim'),
        variant: 'error',
        duration: 5000,
      })
      return
    }

    try {
      setIsLoading(true)
      setCurrentStep('building_transaction')

      const response = await fetch('/api/claim-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddy: walletAddress,
        }),
      })

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`)
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.the_claim_transaction_failed_please_try_again'),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      const data = await response.json()

      if (data.error) {
        console.error(data.error)
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.the_claim_transaction_failed_please_try_again'),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      setCurrentStep('sending_transaction')
      const serializedBuffer = Buffer.from(data.claimRewardTx, 'base64')
      const vtx = VersionedTransaction.deserialize(
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

      setCurrentStep('waiting_for_confirmation')

      const confirmation = await connection.confirmTransaction({
        signature: txid.signature,
        ...(await connection.getLatestBlockhash()),
      })

      confirmToast.dismiss()

      if (confirmation.value.err) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.the_claim_transaction_failed_please_try_again'),
          variant: 'error',
          duration: 5000,
        })
      } else {
        setCurrentStep('transaction_successful')
        toast({
          title: t('trade.transaction_successful'),
          description: t(
            'trade.the_claim_transaction_was_successful_creating_shareable_link'
          ),
          variant: 'success',
          duration: 5000,
        })

        refreshUserInfo()
        router.refresh()
      }
    } catch (err) {
      console.error('Claim rewards error:', err)
      toast({
        title: t('trade.transaction_failed'),
        description: t('trade.the_claim_transaction_failed_please_try_again'),
        variant: 'error',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
      setCurrentStep(null)
    }
  }

  return {
    claimRewards,
    hasRewards,
    currentStep,
    isLoading,
  }
}
