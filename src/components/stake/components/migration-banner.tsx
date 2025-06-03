'use client'

import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn, formatNumber } from '@/utils/utils'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
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
import { useState } from 'react'
import { useMigrationCheck } from '../hooks/use-migration-check'
import { useMigrationExecute } from '../hooks/use-migration-execute'
import { useStakeInfo } from '../hooks/use-stake-info'
import { useStakingV2Data } from '../hooks/use-staking-v2-data'

// Helper function to format SSE amounts with proper decimals (same as modal)
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

interface MigrationBannerProps {
  hideWhenModalOpen?: boolean
  isModalOpen?: boolean
  isOverlayMode?: boolean
}

export function MigrationBanner({
  hideWhenModalOpen = true,
  isModalOpen = false,
  isOverlayMode = false,
}: MigrationBannerProps) {
  const t = useTranslations('stake.migration')
  const tUnlock = useTranslations('stake.v2_unlock')
  const { walletAddress } = useCurrentWallet()
  const { needsMigration, isLoading, error, oldAccountData } =
    useMigrationCheck()
  const { executeMigration, isProcessing } = useMigrationExecute()
  const { data: stakingData } = useStakingV2Data(walletAddress)
  const { refreshUserInfo } = useStakeInfo({})
  const [migrationComplete, setMigrationComplete] = useState(false)

  // Don't show if loading, no migration needed, migration complete, or modal is open
  if (
    isLoading ||
    !needsMigration ||
    migrationComplete ||
    (hideWhenModalOpen && isModalOpen)
  ) {
    return null
  }

  const handleMigration = async () => {
    const result = await executeMigration()
    if (result.success) {
      setMigrationComplete(true)
      // Refresh stake info to show updated data
      refreshUserInfo()
    }
  }

  // Calculate total claimable amount (100 SSE loyalty + unclaimed rewards)
  const calculateTotalClaimable = () => {
    const loyaltyReward = 100
    const unclaimedRewards =
      stakingData && stakingData.status === 'under-claimed'
        ? Math.abs(stakingData.overClaimed || 0)
        : 0
    return loyaltyReward + unclaimedRewards
  }

  if (migrationComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm p-8 mb-6 border border-green-500/30 shadow-xl ${
          isOverlayMode
            ? 'shadow-2xl border-green-500/50 ring-4 ring-green-500/20'
            : ''
        }`}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-green-500/30 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-green-400">
            {t('success_title')}
          </h3>
          <p className="text-base text-gray-300 max-w-2xl">
            {t('success_description')}
          </p>
        </div>
      </motion.div>
    )
  }

  // If in overlay mode, use modal-like design
  if (isOverlayMode) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto rounded-2xl sm:rounded-3xl shadow-2xl border-0 bg-background overflow-hidden"
      >
        {/* Gradient header with animated background (from modal) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/80 to-slate-900 p-4 sm:p-6 text-white">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute left-1/4 top-1/4 h-48 w-48 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
            <div className="absolute right-1/4 bottom-1/4 h-64 w-64 animate-pulse rounded-full bg-blue-500/10 blur-3xl animation-delay-2000" />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
            />
          </div>

          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2">
              <div className="relative">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-300" />
                <div className="absolute inset-0 h-5 w-5 sm:h-6 sm:w-6 animate-ping rounded-full bg-purple-400/30" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                🚀 Staking V2 Upgrade
              </h2>
            </div>
            <p className="text-sm sm:text-base text-purple-100/90">
              Upgrade to V2 staking with enhanced features: stake, unstake, and
              claim rewards multiple times per day with second-by-second reward
              calculations!
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 bg-background">
          {/* Reward banner */}
          <div className="relative">
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
                    {formatSSEAmount(calculateTotalClaimable())} SSE Migration
                    Reward
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground/80">
                    100 SSE loyalty bonus +{' '}
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

          {/* Current staking info */}
          {oldAccountData && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                Your Staking Remains Unchanged
              </h3>
              <div className="rounded-xl bg-gradient-to-br from-muted/30 to-muted/50 backdrop-blur-sm border border-border/50 p-3 sm:p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Staked Amount</span>
                    <span className="font-medium">
                      {formatNumber(
                        Number(oldAccountData.deposit) / Math.pow(10, 6)
                      )}{' '}
                      SSE
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-green-500">
                      {oldAccountData.initialized ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 p-2 sm:p-3 bg-blue-500/10 backdrop-blur-sm rounded-lg border border-blue-500/30">
                  <p className="text-xs text-blue-200">
                    ✅ Current staking stays active • Enhanced daily operations
                    • Real-time reward tracking
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Analysis section (if we have v2 data) */}
          {stakingData && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Reward Analysis
              </h3>
              <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-3 sm:p-4 space-y-2">
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Total Transactions
                    </span>
                    <span className="font-medium px-2 py-0.5 bg-muted/50 backdrop-blur-sm rounded-full">
                      {stakingData.totalTransactions || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Fair Rewards</span>
                    <span className="font-medium text-green-500 px-2 py-0.5 bg-green-500/10 backdrop-blur-sm rounded-full">
                      {formatSSEAmount(stakingData.fairRewardsTokens)} SSE
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Actually Claimed
                    </span>
                    <span className="font-medium px-2 py-0.5 bg-muted/50 backdrop-blur-sm rounded-full">
                      {formatSSEAmount(stakingData.actualClaimedTokens)} SSE
                    </span>
                  </div>
                  {stakingData.overClaimed !== undefined &&
                    stakingData.overClaimed !== 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          {stakingData.status === 'over-claimed'
                            ? 'Over Claimed'
                            : 'Under Claimed'}
                        </span>
                        <span
                          className={cn(
                            'font-medium px-2 py-0.5 backdrop-blur-sm rounded-full',
                            stakingData.status === 'over-claimed'
                              ? 'text-orange-500 bg-orange-500/10'
                              : 'text-blue-500 bg-blue-500/10'
                          )}
                        >
                          {formatSSEAmount(Math.abs(stakingData.overClaimed))}{' '}
                          SSE
                        </span>
                      </div>
                    )}
                </div>

                {/* Explanation */}
                <div className="mt-3 p-2 sm:p-3 bg-muted/30 backdrop-blur-sm rounded-lg border border-border/30">
                  <p className="text-xs text-muted-foreground">
                    {stakingData.status === 'under-claimed'
                      ? `Upgrade to V2 staking for flexible daily operations and precise reward tracking! Plus get your 100 SSE loyalty bonus and ${formatSSEAmount(
                          Math.abs(stakingData.overClaimed || 0)
                        )} SSE unclaimed rewards.`
                      : 'Upgrade to V2 staking for enhanced features: multiple daily operations, second-by-second reward calculations, plus a 100 SSE loyalty bonus!'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Migration CTA */}
          <div className="pt-2">
            <button
              onClick={handleMigration}
              disabled={isProcessing}
              className="w-full h-10 sm:h-11 bg-gradient-to-r from-purple-600/90 to-purple-700/90 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 text-sm rounded-xl border-0 font-medium flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Upgrading to V2...
                </>
              ) : (
                <>
                  📊 Upgrade Tracking & Claim{' '}
                  {formatSSEAmount(calculateTotalClaimable())} SSE
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Original banner design for non-overlay mode
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm p-8 mb-6 border border-yellow-500/30 shadow-xl"
    >
      <div className="flex flex-col space-y-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full bg-yellow-500/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-yellow-400 mb-2">
              Staking V2 Upgrade Available
            </h3>
            <p className="text-sm text-gray-300">
              Upgrade to our enhanced staking system with flexible operations
              (stake/unstake/claim multiple times daily) and precise
              second-by-second reward calculations. Your current staking remains
              active during the upgrade.
            </p>
          </div>
        </div>

        {oldAccountData && (
          <div className="bg-black/30 rounded-xl p-4 border border-yellow-500/20">
            <h4 className="text-sm font-medium text-yellow-400 mb-3">
              {t('current_status_title')}
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400">{t('staked')}</p>
                <p className="font-semibold text-white">
                  {formatNumber(
                    Number(oldAccountData.deposit) / Math.pow(10, 6)
                  )}{' '}
                  SSE
                </p>
              </div>
              <div>
                <p className="text-gray-400">{t('last_update')}</p>
                <p className="font-semibold text-white">
                  {new Date(
                    Number(oldAccountData.lastUpdate) * 1000
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400">{t('status')}</p>
                <p className="font-semibold text-white">
                  {oldAccountData.initialized
                    ? t('status_active')
                    : t('status_inactive')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between bg-black/30 rounded-xl p-4 border border-yellow-500/20">
          <div className="flex-1">
            <p className="text-sm text-gray-300 mb-1">
              Enable flexible staking operations & real-time reward tracking
            </p>
            <p className="text-xs text-gray-400">
              ✅ Multiple daily operations • Second-by-second rewards • Enhanced
              flexibility
            </p>
          </div>
          <button
            onClick={handleMigration}
            disabled={isProcessing}
            className="ml-4 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>🚀 Upgrade to V2</span>
              </>
            ) : (
              <>
                🚀 Upgrade to V2 & Claim{' '}
                {formatSSEAmount(calculateTotalClaimable())} SSE
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
