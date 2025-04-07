import { useStakeInfo } from '@/components-new-version/stake/hooks/useStakeInfo'
import { StakeFilterType } from '@/components-new-version/stake/stake-content'
import { ClaimsForm } from '@/components-new-version/stake/stake-data/claims-form'
import { Card, CardContent, Spinner } from '@/components-new-version/ui'
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
              <div>
                <p className="font-bold">No Staking Found</p>
                <p className="text-xs text-muted-foreground">
                  You haven't staked any tokens yet. Please use the Stake tab to
                  stake tokens before attempting to unstake.
                </p>
              </div>
            )}
            <p>unstake form</p>
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
        <DisplayData
          label={t('trade.platform_total_stake')}
          value={formattedTotalStake}
          loading={showUserInfoLoading}
        />

        <DisplayData
          label={t('trade.total_reward_amount')}
          value={formattedRewardsAmount}
          loading={showUserInfoLoading}
        />
      </div>

      <div>
        <DisplayData
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

function DisplayData({
  label,
  value,
  loading,
}: {
  label: string
  value: string
  loading: boolean
}) {
  return (
    <div>
      <div className="items-center flex text-lg space-x-2 mb-2">
        <p className="font-bold text-primary">SSE</p>
        <p>{label}</p>
      </div>
      {loading ? (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <div className="flex space-x-2">
          <span className="text-3xl text-primary font-bold">{value}</span>
          <span className="text-primary">tokens</span>
        </div>
      )}
    </div>
  )
}
