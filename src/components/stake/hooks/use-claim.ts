import { useStakeInfo } from '@/components/stake/hooks/use-stake-info'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props {
  rewardsAmount: string
}

export function useClaimRewards({ rewardsAmount }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<string | null>(null)

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
      toast.error(t('trade.transaction_failed'), {
        description: t('trade.no_rewards_to_claim'),
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

        toast.error(t('trade.transaction_failed'), {
          description: t('trade.the_claim_transaction_failed_please_try_again'),
        })

        return
      }

      const data = await response.json()

      if (data.error) {
        console.error(data.error)

        toast.error(t('trade.transaction_failed'), {
          description: t('trade.the_claim_transaction_failed_please_try_again'),
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

      const confirmToastId = toast.loading(t('trade.confirming_transaction'), {
        description: t('trade.waiting_for_confirmation'),
        duration: 1000000000,
      })

      setCurrentStep('waiting_for_confirmation')

      const confirmation = await connection.confirmTransaction({
        signature: txid.signature,
        ...(await connection.getLatestBlockhash()),
      })

      toast.dismiss(confirmToastId)

      if (confirmation.value.err) {
        toast.error(t('trade.transaction_failed'), {
          description: t('trade.the_claim_transaction_failed_please_try_again'),
        })
      } else {
        setCurrentStep('transaction_successful')
        toast.success(t('trade.transaction_successful'), {
          description: t(
            'trade.the_claim_transaction_was_successful_creating_shareable_link'
          ),
        })

        refreshUserInfo()
        router.refresh()
      }
    } catch (err) {
      console.error('Claim rewards error:', err)
      toast.error(t('trade.transaction_failed'), {
        description: t('trade.the_claim_transaction_failed_please_try_again'),
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
