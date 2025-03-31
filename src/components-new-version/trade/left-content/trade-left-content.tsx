'use client'

import { FilterTabs } from '@/components-new-version/common/filter-tabs'
import { Perpetual } from '@/components-new-version/trade/left-content/perpetual/perpetual'
import { Swap } from '@/components-new-version/trade/left-content/swap/swap'
import { useState } from 'react'

export enum FilterType {
  SWAP = 'swap',
  PERPETUAL = 'perpetual',
}

export function TradeLeftContent() {
  const [selectedType, setSelectedType] = useState<FilterType>(FilterType.SWAP)

  const options = [
    { label: 'Swap', value: FilterType.SWAP },
    { label: 'Perpetual', value: FilterType.PERPETUAL },
  ]

  return (
    <div className="w-1/3 relative">
      <FilterTabs
        options={options}
        selected={selectedType}
        onSelect={setSelectedType}
      />

      {selectedType === FilterType.SWAP && <Swap />}
      {selectedType === FilterType.PERPETUAL && <Perpetual />}
    </div>
  )
}
