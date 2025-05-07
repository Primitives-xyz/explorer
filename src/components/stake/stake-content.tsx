'use client'

import { StakeData } from '@/components/stake/stake-data/stake-data'
import { StakeDetails } from '@/components/stake/stake-details/stake-details'
import { Card, CardContent, FilterTabs } from '@/components/ui'
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
}
