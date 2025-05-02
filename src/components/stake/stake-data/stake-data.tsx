import { useStakeInfo } from '@/components/stake/hooks/use-stake-info'
import { StakeFilterType } from '@/components/stake/stake-content'
import { ClaimsForm } from '@/components/stake/stake-data/claims-form'
import { DisplayStakeData } from '@/components/stake/stake-data/display-stake-data'
import { StakeForm } from '@/components/stake/stake-data/stake-form'
import { UnstakeForm } from '@/components/stake/stake-data/unstake-form'
import { Card, CardContent } from '@/components/ui'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { useTranslations } from 'next-intl'

interface Props {
  selectedType: StakeFilterType
}

export function StakeData({ selectedType }: Props) {
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

  const formattedTotalStake = formatSmartNumber(
    totalStakeAmount === '0' ? totalStakeAmount2 : totalStakeAmount,
    {
      micro: true,
    }
  )

  // Ensure rewards amount is never negative
  const nonNegativeRewardsAmount =
    typeof rewardsAmount === 'string'
      ? Math.max(0, parseFloat(rewardsAmount)).toString()
      : '0'

  const formattedRewardsAmount = formatSmartNumber(nonNegativeRewardsAmount, {
    micro: true,
    compact: false,
    withComma: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  })

  const formattedStakeAmount = formatSmartNumber(stakeAmount, {
    micro: true,
    minimumFractionDigits: 6,
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
                <p className="font-bold">No Staking Found</p>
                <p className="text-xs text-muted-foreground">
                  You haven't staked any tokens yet. Please use the Stake tab to
                  stake tokens before attempting to unstake.
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

  return (
    <div className="flex flex-col space-y-10">
      <div className="flex flex-col md:flex-row justify-between md:items-center space-y-6 md:space-y-0">
        <DisplayStakeData
          label={t('trade.platform_total_stake')}
          value={formattedTotalStake}
          loading={showUserInfoLoading}
        />

        <DisplayStakeData
          label={t('trade.total_reward_amount')}
          value={formattedRewardsAmount}
          loading={showUserInfoLoading}
        />
      </div>

      <div>
        <DisplayStakeData
          label={t('trade.total_staking_amount')}
          value={formattedStakeAmount}
          loading={showUserInfoLoading}
        />
        {!hasStaked &&
          (selectedType === StakeFilterType.UNSTAKE ||
            selectedType === StakeFilterType.CLAIM_REWARDS) && (
            <p className="text-xs text-destructive mt-1">
              You haven't staked yet.
              <br /> Stake tokens first to see your balance here.
            </p>
          )}
      </div>
      <Card className="bg-card-accent">
        <CardContent>
          <div>{renderForm()}</div>
        </CardContent>
      </Card>
    </div>
  )
}
