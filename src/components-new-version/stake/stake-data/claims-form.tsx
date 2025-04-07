import { useStakeInfo } from '@/components-new-version/stake/hooks/useStakeInfo'
import { Button, Spinner } from '@/components-new-version/ui'
import { useToast } from '@/components-new-version/ui/toast/hooks/use-toast'
import { formatSmartNumber } from '@/components-new-version/utils/formatting/format-number'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ClaimsForm() {
  const t = useTranslations()
  const { toast } = useToast()
  const { primaryWallet, walletAddress } = useCurrentWallet()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const { rewardsAmount, showUserInfoLoading, refreshUserInfo } = useStakeInfo(
    {}
  )

  if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
    throw new Error('Wallet not connected')
  }

  const formattedRewardsAmount = formatSmartNumber(rewardsAmount, {
    micro: true,
    compact: false,
    withComma: false,
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  })

  const hasRewards = rewardsAmount && parseFloat(rewardsAmount) > 0

  const handleClaimRewards = async () => {
    if (!walletAddress || !primaryWallet) {
      toast({
        title: t('trade.transaction_failed'),
        description: t('error.wallet_not_connected'),
        variant: 'error',
        duration: 5000,
      })
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

      // Fetch the claim transaction from the API
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
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Deserialize the transaction
      setCurrentStep('sending_transaction')
      const serializedBuffer = Buffer.from(data.claimRewardTx, 'base64')
      const vtx = VersionedTransaction.deserialize(
        Uint8Array.from(serializedBuffer)
      )

      // Get signer and sign+send transaction
      const signer = await primaryWallet.getSigner()
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')

      // Simulate transaction first (optional but good for debugging)
      const simulateTx = await connection.simulateTransaction(vtx)
      console.log('sim:', simulateTx)

      // Sign and send transaction
      const txid = await signer.signAndSendTransaction(vtx)

      // Show confirmation toast
      const confirmToast = toast({
        title: t('trade.confirming_transaction'),
        description: t('trade.waiting_for_confirmation'),
        variant: 'pending',
        duration: 1000000000,
      })

      setCurrentStep('waiting_for_confirmation')
      // Wait for confirmation
      const tx = await connection.confirmTransaction({
        signature: txid.signature,
        ...(await connection.getLatestBlockhash()),
      })

      confirmToast.dismiss()

      if (tx.value.err) {
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

        // Refresh user info after successful claim
        refreshUserInfo()

        // Refresh the page to update the rewards amount
        router.refresh()
      }
    } catch (error) {
      console.error('Claim rewards error:', error)
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

  return (
    <div>
      <h3 className="text-lg">{t('trade.claim_rewards')}</h3>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-muted-foreground">
            {t('trade.total_reward_amount')}
          </span>
          {showUserInfoLoading ? (
            <Spinner />
          ) : (
            <span className="text-primary">{formattedRewardsAmount} SSE</span>
          )}
        </div>
      </div>

      {!hasRewards && (
        <div>
          <p className="text-md">No Rewards Available</p>
          <p className="text-sm">
            You don‘t have any rewards to claim at the moment. Stake more tokens
            or wait for rewards to accumulate.
          </p>
        </div>
      )}

      {hasRewards && (
        <Button
          onClick={handleClaimRewards}
          disabled={isLoading || !hasRewards}
          expand
        >
          {isLoading ? (
            <>
              <Spinner />
              {currentStep === 'building_transaction' &&
                t('trade.building_transaction')}
              {currentStep === 'sending_transaction' &&
                t('trade.sending_transaction')}
              {currentStep === 'waiting_for_confirmation' &&
                t('trade.waiting_for_confirmation')}
              {currentStep === 'transaction_successful' &&
                t('trade.transaction_successful')}
              {!currentStep && t('common.loading')}
            </>
          ) : !!walletAddress ? (
            t('trade.claim_available_rewards')
          ) : (
            t('common.connect_wallet')
          )}
        </Button>
      )}

      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          Claim your accumulated rewards from staking SSE tokens. Rewards are
          calculated based on your stake amount and platform activity.
        </p>
      </div>
    </div>
  )
}
