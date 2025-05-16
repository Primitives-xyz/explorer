import { useStakeInfo } from '@/components/stake/hooks/use-stake-info'
import { Button, ButtonVariant, Card, Spinner } from '@/components/ui'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useTranslations } from 'next-intl'
import { useClaimRewards } from '../hooks/use-claim'

interface Props {
  className?: string
}

export function ClaimsForm({ className }: Props) {
  const t = useTranslations()
  const { isLoggedIn, sdkHasLoaded, setShowAuthFlow } = useCurrentWallet()
  const { rewardsAmount, showUserInfoLoading } = useStakeInfo({})

  // Ensure rewards amount is never negative
  const nonNegativeRewardsAmount =
    typeof rewardsAmount === 'string'
      ? Math.max(0, parseFloat(rewardsAmount)).toString()
      : '0'

  const formattedRewardsAmount = formatSmartNumber(nonNegativeRewardsAmount, {
    micro: true,
    compact: false,
    withComma: false,
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  })

  const { claimRewards, hasRewards, currentStep, isLoading } = useClaimRewards({
    rewardsAmount: nonNegativeRewardsAmount,
  })

  // Determine claim button state text
  const getClaimButtonText = () => {
    if (isLoading) {
      if (currentStep === 'building_transaction')
        return t('stake.transaction.building')
      if (currentStep === 'sending_transaction')
        return t('stake.transaction.sending')
      if (currentStep === 'waiting_for_confirmation')
        return t('stake.transaction.waiting_confirmation')
      if (currentStep === 'transaction_successful')
        return t('stake.transaction.successful')
      return t('common.loading')
    }

    return t('stake.claim.available_rewards')
  }

  // Render wallet connection states
  if (!sdkHasLoaded) {
    return (
      <Button variant={ButtonVariant.OUTLINE} className="w-full">
        <Spinner />
        <p>{t('stake.transaction.checking_wallet')}</p>
      </Button>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className={className}>
        <h3 className="text-lg mb-4">{t('stake.claim.title')}</h3>
        <Button
          variant={ButtonVariant.OUTLINE}
          className="w-full"
          onClick={() => setShowAuthFlow(true)}
        >
          {t('common.connect_wallet')}
        </Button>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>{t('stake.claim.connect_wallet_description')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <h3 className="text-lg mb-4">{t('stake.claim.title')}</h3>

      <Card className="p-4 mb-6 bg-card/40">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">
            {t('stake.claim.available_rewards')}
          </span>
          {showUserInfoLoading ? (
            <Spinner className="w-4 h-4" />
          ) : (
            <span className="text-primary font-medium">
              {formattedRewardsAmount} SSE
            </span>
          )}
        </div>
      </Card>

      {!hasRewards && (
        <div className="bg-card/40 p-4 rounded-md mb-6">
          <p className="font-medium">{t('stake.claim.no_rewards')}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t('stake.claim.no_rewards_description')}
          </p>
        </div>
      )}

      <Button
        onClick={claimRewards}
        disabled={isLoading || !hasRewards}
        className="w-full"
      >
        {isLoading && <Spinner className="mr-2" />}
        {getClaimButtonText()}
      </Button>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>{t('stake.claim.description')}</p>
      </div>
    </div>
  )
}
