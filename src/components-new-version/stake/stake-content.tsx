'use client'

import { FilterTabs } from '@/components-new-version/ui'
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
    <div className="flex flex-col w-full">
      <FilterTabs
        options={options}
        selected={selectedType}
        onSelect={setSelectedType}
      />

      {selectedType === StakeFilterType.STAKE && <p>stake</p>}
      {selectedType === StakeFilterType.UNSTAKE && <p>unstake</p>}
      {selectedType === StakeFilterType.CLAIM_REWARDS && <p>claim reward</p>}
    </div>
  )
}
