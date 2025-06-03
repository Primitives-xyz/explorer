'use client'

import { Card, CardContent } from '@/components/ui'
import { useTranslations } from 'next-intl'

export enum StakeFilterType {
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  CLAIM_REWARDS = 'claim-rewards',
}

export function StakeContent() {
  const t = useTranslations('stake')

  // Under construction overlay
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-8">
      <Card className="max-w-md w-full text-center">
        <CardContent className="p-8">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold mb-4 text-primary">
            Under Construction
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <p className="text-lg">
              We're currently migrating things on-chain to bring you an even
              better staking experience!
            </p>
            <p className="font-medium">We'll be done soon! ⚡</p>
            <div className="flex justify-center items-center gap-2 mt-6">
              <div className="animate-bounce">🔧</div>
              <span className="text-sm">Working hard behind the scenes...</span>
              <div className="animate-bounce delay-100">⚙️</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Original content (commented out for now)
  /*
  const options = [
    { label: t('tabs.stake'), value: StakeFilterType.STAKE },
    { label: t('tabs.unstake'), value: StakeFilterType.UNSTAKE },
    { label: t('tabs.claim_rewards'), value: StakeFilterType.CLAIM_REWARDS },
  ]

  const [selectedType, setSelectedType] = useState<StakeFilterType>(
    StakeFilterType.STAKE
  )

  return (
    <div className="flex flex-col md:flex-row w-full justify-between gap-4 pb-10">
      <div className="w-full md:w-1/2">
        <FilterTabs
          options={options}
          selected={selectedType}
          onSelect={setSelectedType}
        />
        <Card>
          <CardContent>
            <StakeData selectedType={selectedType} />
          </CardContent>
        </Card>
      </div>
      <div className="w-full md:w-1/2 md:pt-[52px]">
        <StakeDetails />
      </div>
    </div>
  )
  */
}
