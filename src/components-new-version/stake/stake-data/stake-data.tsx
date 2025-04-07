import { useStakeInfo } from '@/components-new-version/stake/hooks/useStakeInfo'
import { StakeFilterType } from '@/components-new-version/stake/stake-content'
import { ClaimsForm } from '@/components-new-version/stake/stake-data/claims-form'
import { DisplayStakeData } from '@/components-new-version/stake/stake-data/display-stake-data'
import { UnstakeForm } from '@/components-new-version/stake/stake-data/unstake-form'
import { Card, CardContent } from '@/components-new-version/ui'
import { formatSmartNumber } from '@/components-new-version/utils/formatting/format-number'
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

  const formattedRewardsAmount = formatSmartNumber(rewardsAmount, {
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
        return <p>stake form</p>

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
      <div className="flex justify-between items-center">
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
              You haven‘t staked yet.
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
