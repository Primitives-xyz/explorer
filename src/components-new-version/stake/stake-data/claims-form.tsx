import { useStakeInfo } from '@/components-new-version/stake/hooks/use-stake-info'
import { Button, ButtonVariant, Spinner } from '@/components-new-version/ui'
import { formatSmartNumber } from '@/components-new-version/utils/formatting/format-number'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { useTranslations } from 'next-intl'
import { useClaimRewards } from '../hooks/use-claim'

export function ClaimsForm() {
  const t = useTranslations()
  const { isLoggedIn, sdkHasLoaded, walletAddress, setShowAuthFlow } =
    useCurrentWallet()
  const { rewardsAmount, showUserInfoLoading } = useStakeInfo({})

  const formattedRewardsAmount = formatSmartNumber(rewardsAmount, {
    micro: true,
    compact: false,
    withComma: false,
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  })

  const { claimRewards, hasRewards, currentStep, isLoading } = useClaimRewards({
    rewardsAmount,
  })

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

      {!sdkHasLoaded ? (
        <Button variant={ButtonVariant.OUTLINE} expand className="mt-4">
          <Spinner />
          <p>{t('trade.checking_wallet_status')}</p>
        </Button>
      ) : !isLoggedIn ? (
        <Button
          variant={ButtonVariant.OUTLINE}
          expand
          className="mt-4"
          onClick={() => setShowAuthFlow(true)}
        >
          {t('common.connect_wallet')}
        </Button>
      ) : (
        <>
          {!hasRewards && (
            <div>
              <p className="text-md">No Rewards Available</p>
              <p className="text-sm">
                You don‘t have any rewards to claim at the moment. Stake more
                tokens or wait for rewards to accumulate.
              </p>
            </div>
          )}

          {hasRewards && (
            <Button
              onClick={claimRewards}
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
        </>
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
