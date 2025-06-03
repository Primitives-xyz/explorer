'use client'

import { Button, Dialog, DialogContent, DialogFooter } from '@/components/ui'
import { createSSETransferInstruction } from '@/services/jupiter'
import { SSE_TOKEN_DECIMAL, SSE_TOKEN_MINT } from '@/utils/constants'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn } from '@/utils/utils'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import {
  ArrowRight,
  CheckCircle,
  Gift,
  Loader2,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useStakingV2Data } from '../hooks/use-staking-v2-data'

// Helper function to format SSE amounts with proper decimals
const formatSSEAmount = (amount: number | undefined): string => {
  if (!amount || amount === 0) return '0'

  // For very small amounts, show up to 6 decimal places
  if (amount < 0.01) {
    return amount.toFixed(6).replace(/\.?0+$/, '')
  }
  // For small amounts, show up to 3 decimal places
  if (amount < 100) {
    return amount.toFixed(3).replace(/\.?0+$/, '')
  }
  // For larger amounts, use toLocaleString with 2 decimals
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

interface StakingV2UnlockModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stakeAmount: string
  onSuccess?: () => void
}

export function StakingV2UnlockModal({
  open,
  onOpenChange,
  stakeAmount,
  onSuccess,
}: StakingV2UnlockModalProps) {
  const t = useTranslations('stake.v2_unlock')
  const { walletAddress, primaryWallet } = useCurrentWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [showContent, setShowContent] = useState(false)

  const { data: stakingData, isLoading } = useStakingV2Data(walletAddress)

  // Animation trigger
  useEffect(() => {
    if (open) {
      setTimeout(() => setShowContent(true), 100)
    } else {
      setShowContent(false)
    }
  }, [open])

  const handleClaimReward = async () => {
    if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
      toast.error(t('connect_wallet_error'))
      return
    }

    setIsProcessing(true)
    try {
      const connection = new Connection('https://api.mainnet-beta.solana.com')
      const userPubkey = new PublicKey(walletAddress)
      const sseTokenMint = new PublicKey(SSE_TOKEN_MINT)

      // Treasury wallet that holds the SSE rewards
      // This should match the public key from the treasury private key in the API
      const treasuryWallet = new PublicKey(
        '5wYGiip89N1BnQj8hmgK1tQqU2EDFjxMRtJfmuCayFmV'
      )

      // Get user's SSE token account address
      const userTokenAccount = await getAssociatedTokenAddress(
        sseTokenMint,
        userPubkey
      )

      // Get treasury's SSE token account address
      const treasuryTokenAccount = await getAssociatedTokenAddress(
        sseTokenMint,
        treasuryWallet
      )

      // Calculate total amount to claim (100 SSE loyalty + unclaimed fair rewards)
      const loyaltyReward = 100
      const unclaimedRewards =
        stakingData && stakingData.status === 'under-claimed'
          ? Math.abs(stakingData.overClaimed || 0)
          : 0
      const totalAmount =
        (loyaltyReward + unclaimedRewards) * Math.pow(10, SSE_TOKEN_DECIMAL)

      const transferInstruction = await createSSETransferInstruction(
        connection,
        treasuryTokenAccount,
        userTokenAccount,
        treasuryWallet, // owner of the treasury account
        totalAmount.toString()
      )

      const transaction = new Transaction().add(transferInstruction)

      // Set recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = userPubkey

      // Get signer from Dynamic wallet
      const signer = await primaryWallet.getSigner()

      // Sign and send the transaction
      const signature = await signer.signAndSendTransaction(transaction)

      // Wait for confirmation
      const latestBlockhash = await connection.getLatestBlockhash()
      const confirmation = await connection.confirmTransaction({
        signature: signature.signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      })

      if (confirmation.value.err) {
        throw new Error('Transaction failed during confirmation')
      }

      setTransactionHash(signature.signature)
      toast.success(t('success_title'))

      if (onSuccess) {
        onSuccess()
      }

      // Close modal after a delay to show success state
      setTimeout(() => {
        onOpenChange(false)
      }, 3000)
    } catch (error) {
      console.error('Error claiming reward:', error)
      toast.error(t('claim_failed'))
    } finally {
      setIsProcessing(false)
    }
  }

  // Calculate total claimable amount
  const calculateTotalClaimable = () => {
    const loyaltyReward = 100
    const unclaimedRewards =
      stakingData && stakingData.status === 'under-claimed'
        ? Math.abs(stakingData.overClaimed || 0)
        : 0
    return loyaltyReward + unclaimedRewards
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md mx-auto p-0 rounded-2xl sm:rounded-3xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
        {/* Gradient header with more subtle, sophisticated animation */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/80 to-slate-900 p-4 sm:p-6 text-white rounded-t-2xl sm:rounded-t-3xl">
          {/* Animated background with more subtle effects */}
          <div className="absolute inset-0">
            {/* Subtle animated gradient orbs */}
            <div className="absolute left-1/4 top-1/4 h-48 w-48 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
            <div className="absolute right-1/4 bottom-1/4 h-64 w-64 animate-pulse rounded-full bg-blue-500/10 blur-3xl animation-delay-2000" />
            {/* Subtle dot pattern overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
            />
          </div>

          <div className="relative z-10">
            <div
              className={cn(
                'mb-2 flex items-center gap-2 transition-all duration-700',
                showContent
                  ? 'translate-y-0 opacity-100'
                  : '-translate-y-4 opacity-0'
              )}
            >
              <div className="relative">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-300" />
                <div className="absolute inset-0 h-5 w-5 sm:h-6 sm:w-6 animate-ping rounded-full bg-purple-400/30" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                {t('title')}
              </h2>
            </div>
            <p
              className={cn(
                'text-sm sm:text-base text-purple-100/90 transition-all duration-700 delay-100',
                showContent
                  ? 'translate-y-0 opacity-100'
                  : '-translate-y-4 opacity-0'
              )}
            >
              {t('subtitle')}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 bg-background">
          {/* Reward banner with subtle glow effect */}
          <div
            className={cn(
              'relative transition-all duration-700 delay-200',
              showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            )}
          >
            {/* Subtle glow background */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 blur-xl" />

            <div className="relative rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 backdrop-blur-sm p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-green-400/20 blur-xl" />
                  <Gift className="relative h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                  <Zap className="absolute -right-1 -top-1 h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-lg sm:text-xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {formatSSEAmount(calculateTotalClaimable())} SSE Total
                    Reward
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground/80">
                    100 SSE loyalty +{' '}
                    {formatSSEAmount(
                      stakingData && stakingData.status === 'under-claimed'
                        ? Math.abs(stakingData.overClaimed || 0)
                        : 0
                    )}{' '}
                    SSE unclaimed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current staking info with subtle styling */}
          <div
            className={cn(
              'space-y-3 transition-all duration-700 delay-300',
              showContent
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            )}
          >
            <h3 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              {t('staking_summary')}
            </h3>
            <div className="rounded-xl bg-gradient-to-br from-muted/30 to-muted/50 backdrop-blur-sm border border-border/50 p-3 sm:p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500/60 animate-pulse" />
                  {t('staked_amount')}
                </span>
                <span className="font-medium text-sm sm:text-base">
                  {Number(stakeAmount) / 10 ** SSE_TOKEN_DECIMAL} SSE
                </span>
              </div>
            </div>
          </div>

          {/* Credits calculation with enhanced visuals */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <div className="relative">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-purple-500" />
                <div className="absolute inset-0 h-6 w-6 sm:h-8 sm:w-8 animate-ping rounded-full bg-purple-500/20" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('loading_credits')}
              </p>
            </div>
          ) : stakingData ? (
            <div
              className={cn(
                'space-y-3 transition-all duration-700 delay-400',
                showContent
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-4 opacity-0'
              )}
            >
              <h3 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                {t('analysis_title')}
              </h3>
              <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-3 sm:p-4 space-y-2">
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {t('total_transactions')}
                    </span>
                    <span className="font-medium px-2 py-0.5 bg-muted/50 backdrop-blur-sm rounded-full text-xs sm:text-sm">
                      {stakingData.totalTransactions || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {t('total_staked')}
                    </span>
                    <span className="font-medium px-2 py-0.5 bg-muted/50 backdrop-blur-sm rounded-full text-xs sm:text-sm">
                      {formatSSEAmount(stakingData.totalStaked)} SSE
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {t('fair_rewards')}
                    </span>
                    <span className="font-medium text-green-500 px-2 py-0.5 bg-green-500/10 backdrop-blur-sm rounded-full text-xs sm:text-sm">
                      {formatSSEAmount(stakingData.fairRewardsTokens)} SSE
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {t('actually_claimed')}
                    </span>
                    <span className="font-medium px-2 py-0.5 bg-muted/50 backdrop-blur-sm rounded-full text-xs sm:text-sm">
                      {formatSSEAmount(stakingData.actualClaimedTokens)} SSE
                    </span>
                  </div>
                  {stakingData.overClaimed !== undefined &&
                    stakingData.overClaimed !== 0 &&
                    stakingData.status === 'under-claimed' && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-xs sm:text-sm">
                          {t('additional_rewards')}
                        </span>
                        <span className="font-medium px-2 py-0.5 backdrop-blur-sm rounded-full text-xs sm:text-sm text-blue-500 bg-blue-500/10">
                          {formatSSEAmount(Math.abs(stakingData.overClaimed))}{' '}
                          SSE
                        </span>
                      </div>
                    )}
                  <div className="border-t border-border/50 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-xs sm:text-sm">
                        {t('your_status')}
                      </span>
                      <span
                        className={cn(
                          'font-medium text-xs sm:text-sm px-3 py-1 backdrop-blur-sm rounded-full',
                          stakingData.status === 'under-claimed'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-green-500/10 text-green-500'
                        )}
                      >
                        {stakingData.status === 'under-claimed'
                          ? t('status.eligible_for_more')
                          : t('status.fully_rewarded')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Explanation text with subtle background */}
                <div className="mt-3 p-2 sm:p-3 bg-muted/30 backdrop-blur-sm rounded-lg border border-border/30">
                  <p className="text-xs text-muted-foreground">
                    {stakingData.status === 'under-claimed'
                      ? `Great news! You've earned ${formatSSEAmount(
                          stakingData.actualClaimedTokens
                        )} SSE so far. This transaction will unlock your 100 SSE loyalty bonus plus ${formatSSEAmount(
                          Math.abs(stakingData.overClaimed || 0)
                        )} SSE in additional rewards, bringing your total rewards up to date!`
                      : `Fantastic! You've successfully claimed ${formatSSEAmount(
                          stakingData.actualClaimedTokens
                        )} SSE in rewards. This transaction includes your 100 SSE loyalty bonus for being such a valued community member!`}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Success state with subtle animation */}
          {transactionHash && (
            <div className="relative rounded-xl bg-gradient-to-br from-green-500/5 to-emerald-500/5 backdrop-blur-sm border border-green-500/20 p-3 sm:p-4 animate-in slide-in-from-bottom-4 duration-500">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 blur-xl" />
              <div className="relative flex items-center gap-3">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 animate-bounce flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base text-green-400">
                    {t('success_title')}
                  </p>
                  <a
                    href={`https://solscan.io/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-green-500/80 hover:text-green-400 transition-colors inline-flex items-center gap-1"
                  >
                    {t('view_transaction')} <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border/50 bg-muted/20 backdrop-blur-sm p-4 rounded-b-2xl sm:rounded-b-3xl">
          <div className="flex w-full">
            {!transactionHash ? (
              <Button
                onClick={handleClaimReward}
                disabled={isProcessing}
                className="w-full h-10 sm:h-11 bg-gradient-to-r from-purple-600/90 to-purple-700/90 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 text-sm rounded-xl border-0"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    {t('processing')}
                  </>
                ) : (
                  <>
                    Claim {formatSSEAmount(calculateTotalClaimable())} SSE
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full h-10 sm:h-11 text-sm rounded-xl border-border/50"
              >
                {t('close')}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
