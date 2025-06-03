import { useStakeInfo } from '@/components/stake/hooks/use-stake-info'
import { StakeFilterType } from '@/components/stake/stake-content'
import { ClaimsForm } from '@/components/stake/stake-data/claims-form'
import { StakeForm } from '@/components/stake/stake-data/stake-form'
import { UnstakeForm } from '@/components/stake/stake-data/unstake-form'
import { Card, CardContent } from '@/components/ui'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { Gift, TrendingUp, Wallet } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  selectedType: StakeFilterType
}

export function StakeData({ selectedType }: Props) {
  const t = useTranslations('stake')
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

  const formattedTotalStake = formatSmartNumber(
    totalStakeAmount === '0' ? totalStakeAmount2 : totalStakeAmount,
    {
      compact: true,
      withComma: true,
    }
  )

  // Ensure rewards amount is never negative
  const nonNegativeRewardsAmount =
    typeof rewardsAmount === 'string'
      ? Math.max(0, parseFloat(rewardsAmount)).toString()
      : '0'

  const formattedRewardsAmount = formatSmartNumber(nonNegativeRewardsAmount, {
    compact: false,
    withComma: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  })

  const formattedStakeAmount = formatSmartNumber(stakeAmount, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
    withComma: true,
  })

  const renderForm = () => {
    switch (selectedType) {
      case StakeFilterType.STAKE:
        return <StakeForm />

      case StakeFilterType.UNSTAKE:
        return (
          <>
            {!hasStaked && (
              <div className="mb-4">
                <p className="font-bold">{t('errors.no_staking_found')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('errors.no_staking_description')}
                </p>
              </div>
            )}

            <UnstakeForm />
          </>
        )

      case StakeFilterType.CLAIM_REWARDS:
        return <ClaimsForm />

      default:
        return null
    }
  }

  if (showUserInfoLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-6 bg-muted rounded w-1/2" />
              </div>
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-6 bg-muted rounded w-1/3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card-accent">
          <CardContent className="p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="space-y-4">
        <Card className="bg-background border border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Platform Total</p>
                </div>
                <p className="text-xl font-bold">{formattedTotalStake}</p>
                <p className="text-xs text-muted-foreground">SSE tokens</p>
              </div>

              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Total Reward Amount</p>
                </div>
                <p className="text-xl font-bold">{formattedRewardsAmount}</p>
                <p className="text-xs text-muted-foreground">tokens</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background border border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Total Staking Amount</p>
            </div>
            <p className="text-2xl font-bold">{formattedStakeAmount}</p>
            <p className="text-xs text-muted-foreground">tokens</p>

            {!hasStaked &&
              (selectedType === StakeFilterType.UNSTAKE ||
                selectedType === StakeFilterType.CLAIM_REWARDS) && (
                <p className="text-xs text-destructive mt-1">
                  {t('errors.no_stake_warning')}
                  <br /> {t('errors.stake_first')}
                </p>
              )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-background border border-border/50 shadow-sm">
        <CardContent className="p-4">{renderForm()}</CardContent>
      </Card>
    </div>
  )
}
