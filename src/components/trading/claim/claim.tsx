import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { Button } from '@/components/ui/button'
import { useStakeInfo } from '@/hooks/use-stake-info'
import { useToast } from '@/hooks/use-toast'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export const ClaimForm = () => {
  const t = useTranslations()
  const { toast } = useToast()
  const { isLoggedIn, sdkHasLoaded, primaryWallet, walletAddress } =
    useCurrentWallet()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const { rewardsAmount, showUserInfoLoading, refreshUserInfo } = useStakeInfo(
    {}
  )

  // Format the token amounts with proper decimal places (dividing by 10^6)
  const formattedRewardsAmount = rewardsAmount
    ? parseFloat((Number(rewardsAmount) / 10 ** 6).toFixed(6))
    : '0.000000'

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
    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-green-400 mb-4">
        {t('trade.claim_rewards')}
      </h3>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">
            {t('trade.total_reward_amount')}
          </span>
          {showUserInfoLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-green-400" />
          ) : (
            <span className="text-green-400 font-medium">
              {formattedRewardsAmount} SSE
            </span>
          )}
        </div>
        <div className="h-2 w-full bg-green-900/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-green-500 to-green-300 rounded-full"
            style={{
              width: hasRewards ? '100%' : '0%',
            }}
          ></div>
        </div>
      </div>

      {!hasRewards && (
        <div className="mb-4 p-4 border border-yellow-500/30 bg-yellow-500/10 rounded-lg">
          <p className="text-yellow-400 font-medium">No Rewards Available</p>
          <p className="text-sm text-gray-300">
            You don&apos;t have any rewards to claim at the moment. Stake more
            tokens or wait for rewards to accumulate.
          </p>
        </div>
      )}

      {hasRewards && (
        <Button
          onClick={handleClaimRewards}
          disabled={isLoading || !hasRewards}
          className="w-full bg-linear-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center h-12"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

      <div className="mt-4 text-sm text-gray-400">
        <p>
          Claim your accumulated rewards from staking SSE tokens. Rewards are
          calculated based on your stake amount and platform activity.
        </p>
      </div>
    </div>
  )
}
