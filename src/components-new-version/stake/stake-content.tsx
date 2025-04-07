'use client'

import { StakeData } from '@/components-new-version/stake/stake-data/stake-data'
import { StakeDetails } from '@/components-new-version/stake/stake-details/stake-details'
import { Card, CardContent, FilterTabs } from '@/components-new-version/ui'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export enum StakeFilterType {
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  CLAIM_REWARDS = 'claim-rewards',
}

export function StakeContent() {
  const options = [
    { label: 'Stake', value: StakeFilterType.STAKE },
    { label: 'UnStake', value: StakeFilterType.UNSTAKE },
    { label: 'Claim Rewards', value: StakeFilterType.CLAIM_REWARDS },
  ]

  const t = useTranslations()

  const [selectedType, setSelectedType] = useState<StakeFilterType>(
    StakeFilterType.STAKE
  )

  return (
    <div className="flex w-full justify-between gap-4">
      <div className="w-1/2">
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
      <div className="w-1/2 pt-[52px]">
        <StakeDetails />
      </div>
    </div>
  )
}
