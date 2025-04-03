import { useStakeInfo } from '@/hooks/use-stake-info'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ClaimForm } from './claim/claim'
import { StakeForm } from './stake/stake'
import { UnstakeForm } from './unstake/unstake'

interface StakingContainerProps {
  mode: 'stake' | 'unstake' | 'claim'
}

export const StakingContainer = ({ mode }: StakingContainerProps) => {
  const t = useTranslations()
  const {
    stakeAmount,
    rewardsAmount,
    showUserInfoLoading,
    hasStaked,
    totalStakeAmount,
  } = useStakeInfo({})

  const { totalStakeAmount: totalStakeAmount2 } = useStakeInfo({
    wallet: 'BprhcaJtUTER4e3ArGYC1bmgjqvyuh1rovY3p8dgv2Eq',
  })

  // Format the token amounts with proper decimal places (dividing by 10^6)
  const formatTokenAmount = (amount: string) => {
    if (!amount || amount === '0') return '0.000000'
    const num = parseInt(amount)
    const value = num / 1000000

    // For mobile-friendly display of large numbers
    if (value >= 1000000) {
      // For values >= 1M, show as X.XX M (e.g., 1.23M)
      return `${(value / 1000000).toFixed(2)}M`
    } else if (value >= 1000) {
      // For values >= 1K, show as X.XX K (e.g., 123.45K)
      return `${(value / 1000).toFixed(2)}K`
    } else {
      // Add thousand separators for better readability
      return value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      })
    }
  }

  const formattedTotalStake = formatTokenAmount(
    totalStakeAmount === '0' ? totalStakeAmount2 : totalStakeAmount
  )
  const formattedStakeAmount = formatTokenAmount(stakeAmount)

  // Format rewards amount with the same approach as token amounts
  const formattedRewardsAmount = rewardsAmount
    ? parseFloat((Number(rewardsAmount) / 10 ** 6).toFixed(6))
    : '0.000000'

  return (
    <div>
      {/* Top Stats Row - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* SSE Total Platform Stake */}
        <div className="relative overflow-hidden bg-linear-to-r from-green-900/40 to-green-800/40 rounded-xl border border-green-500/30">
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-green-500/10 rounded-full blur-xl"></div>

          <div className="relative z-10 p-5">
            <div className="flex items-center mb-2">
              <div className="bg-linear-to-r from-green-500 to-green-400 text-black font-bold text-xl px-2 py-0.5 rounded mr-2">
                SSE
              </div>
              <h2 className="text-lg font-semibold text-green-300">
                {t('trade.platform_total_stake')}
              </h2>
            </div>

            {showUserInfoLoading ? (
              <div className="flex justify-center items-center h-16">
                <Loader2 className="h-8 w-8 animate-spin text-green-400" />
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-green-400 to-green-300 break-all">
                    {formattedTotalStake}
                  </span>
                  <span className="ml-2 text-green-500 font-medium text-xs md:text-sm">
                    tokens
                  </span>
                </div>
                <div className="h-1 w-full bg-linear-to-r from-green-500 to-green-300 rounded-full mt-2"></div>
              </div>
            )}
          </div>
        </div>

        {/* Total Reward Amount */}
        <div className="relative overflow-hidden bg-linear-to-r from-green-900/40 to-green-800/40 rounded-xl border border-green-500/30">
          <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-green-400/10 rounded-full blur-xl"></div>

          <div className="relative z-10 p-5">
            <div className="flex items-center mb-2">
              <div className="bg-linear-to-r from-green-500 to-green-400 text-black font-bold text-xl px-2 py-0.5 rounded mr-2">
                SSE
              </div>
              <h2 className="text-lg font-semibold text-green-300">
                {t('trade.total_reward_amount')}
              </h2>
            </div>

            {showUserInfoLoading ? (
              <div className="flex justify-center items-center h-16">
                <Loader2 className="h-8 w-8 animate-spin text-green-400" />
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-green-400 to-green-300 break-all">
                    {formattedRewardsAmount}
                  </span>
                  <span className="ml-2 text-green-500 font-medium text-xs md:text-sm">
                    tokens
                  </span>
                </div>
                <div className="h-1 w-full bg-linear-to-r from-green-500 to-green-300 rounded-full mt-2"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Your Stake Amount - Enhanced */}
      <div className="mb-8">
        <div className="relative overflow-hidden bg-linear-to-r from-green-900/40 to-green-800/40 rounded-xl border border-green-500/30">
          <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-400/10 rounded-full blur-xl"></div>

          <div className="relative z-10 p-5">
            <div className="flex items-center mb-2">
              <div className="bg-linear-to-r from-green-500 to-green-400 text-black font-bold text-xl px-2 py-0.5 rounded mr-2">
                SSE
              </div>
              <h2 className="text-lg font-semibold text-green-300">
                {t('trade.total_staking_amount')}
              </h2>
            </div>

            {showUserInfoLoading ? (
              <div className="flex justify-center items-center h-16">
                <Loader2 className="h-8 w-8 animate-spin text-green-400" />
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-green-400 to-green-300 break-all">
                    {formattedStakeAmount}
                  </span>
                  <span className="ml-2 text-green-500 font-medium text-xs md:text-sm">
                    tokens
                  </span>
                </div>
                <div className="h-1 w-full bg-linear-to-r from-green-500 to-green-300 rounded-full mt-2"></div>

                {!hasStaked && (mode === 'unstake' || mode === 'claim') && (
                  <p className="text-sm text-yellow-500 mt-3 font-medium">
                    You haven&apos;t staked yet. Stake tokens first to see your
                    balance here.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render the specific form based on mode */}
      <div className="mb-8">
        {mode === 'stake' ? (
          <StakeForm />
        ) : mode === 'unstake' ? (
          <>
            {!hasStaked && (
              <div className="mb-4 p-4 border border-yellow-500/30 bg-yellow-500/10 rounded-lg">
                <p className="text-yellow-400 font-medium">No Staking Found</p>
                <p className="text-sm text-gray-300">
                  You haven&apos;t staked any tokens yet. Please use the Stake
                  tab to stake tokens before attempting to unstake.
                </p>
              </div>
            )}
            <UnstakeForm />
          </>
        ) : (
          <>
            <ClaimForm />
          </>
        )}
      </div>

      {/* Common information panel */}
      <div className="flex flex-col gap-4 border bg-green-900/20 border-green-500/20 rounded-lg p-6 my-3">
        {/* Staking Benefits Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-green-400">
            {t('trade.staking.benefits_title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-800/20 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z"
                    clipRule="evenodd"
                  />
                </svg>
                <h4 className="font-medium text-green-400">
                  {t('trade.staking.fee_sharing')}
                </h4>
              </div>
              <p className="text-sm text-gray-300">
                Earn rewards that dynamically adjust based on platform activity.
                The more you stake, the greater your share of the rewards pool.
              </p>
            </div>
            <div className="bg-green-800/20 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <h4 className="font-medium text-green-400">
                  {t('trade.staking.flexible_staking')}
                </h4>
              </div>
              <p className="text-sm text-gray-300">
                Stake to unlock platform benefits and fee discounts. Your
                rewards grow based on your engagement in the ecosystem.
              </p>
            </div>
          </div>

          {/* Additional Staking Information */}
          <div className="bg-green-800/20 rounded-lg p-4 border border-green-500/30 mt-4">
            <h4 className="font-medium text-green-400 mb-2">How It Works</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <svg
                  className="h-5 w-5 text-green-400 shrink-0 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Stake once every 24 hours to increase your position and boost
                  your eligibility for rewards
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="h-5 w-5 text-green-400 shrink-0 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Rewards adjust based on your participation level and overall
                  network activity
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="h-5 w-5 text-green-400 shrink-0 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  No fixed APY - incentives grow with ecosystem usage and your
                  stake amount
                </span>
              </li>
            </ul>
          </div>

          {/* Staking Tiers */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-green-400 mb-4">
              {t('trade.staking.tiers_title')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Bronze Tier */}
              <div className="relative bg-linear-to-b from-green-800/30 to-green-900/30 rounded-lg p-4 border border-green-500/30 hover:border-green-400/50 transition-all group">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-yellow-700/50 to-yellow-600/50 rounded-t-lg"></div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-3 flex-col">
                    <h4 className="font-medium text-yellow-600">
                      {t('trade.staking.bronze_tier')}
                    </h4>
                    <span className="text-xs bg-green-800/40 px-2 py-1 rounded-full border border-green-500/20">
                      {t('trade.staking.bronze_requirement')}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <svg
                        className="h-4 w-4 text-green-400 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        10% {t('trade.staking.swap_fee_discount').substring(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <svg
                        className="h-4 w-4 text-green-400 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        30%{' '}
                        {t('trade.staking.comment_fee_discount').substring(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Silver Tier */}
              <div className="relative bg-linear-to-b from-green-800/30 to-green-900/30 rounded-lg p-4 border border-green-500/30 hover:border-green-400/50 transition-all group">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-gray-400/70 to-gray-300/70 rounded-t-lg"></div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-3 flex-col">
                    <h4 className="font-medium text-gray-300">
                      {t('trade.staking.silver_tier')}
                    </h4>
                    <span className="text-xs bg-green-800/40 px-2 py-1 rounded-full border border-green-500/20">
                      {t('trade.staking.silver_requirement')}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <svg
                        className="h-4 w-4 text-green-400 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        25% {t('trade.staking.swap_fee_discount').substring(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <svg
                        className="h-4 w-4 text-green-400 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        40%{' '}
                        {t('trade.staking.comment_fee_discount').substring(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gold Tier */}
              <div className="relative bg-linear-to-b from-green-800/30 to-green-900/30 rounded-lg p-4 border border-green-500/30 hover:border-green-400/50 transition-all group">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-yellow-400/70 to-yellow-300/70 rounded-t-lg"></div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-3 flex-col">
                    <h4 className="font-medium text-yellow-400">
                      {t('trade.staking.gold_tier')}
                    </h4>
                    <span className="text-xs bg-green-800/40 px-2 py-1 rounded-full border border-green-500/20">
                      {t('trade.staking.gold_requirement')}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <svg
                        className="h-4 w-4 text-green-400 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        50% {t('trade.staking.swap_fee_discount').substring(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <svg
                        className="h-4 w-4 text-green-400 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        60%{' '}
                        {t('trade.staking.comment_fee_discount').substring(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-4 text-sm text-gray-400 italic text-center">
              {t('trade.staking.disclaimer')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
