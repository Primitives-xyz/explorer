'use client'

import { Swap } from '@/components/swap/components/swap'
import { Perpetual } from '@/components/trade/left-content/perpetual/perpetual'
import { FilterTabs } from '@/components/ui'
import { useState } from 'react'

interface TradeLeftContentProps {
  setTokenMint: (value: string) => void
}

export enum FilterType {
  SWAP = 'swap',
  PERPETUAL = 'perpetual',
}

export function TradeLeftContent({ setTokenMint }: TradeLeftContentProps) {
  const [selectedType, setSelectedType] = useState<FilterType>(FilterType.SWAP)

  const options = [
    { label: 'Swap', value: FilterType.SWAP },
    { label: 'Perpetual', value: FilterType.PERPETUAL },
  ]

  return (
    <div className="w-1/3">
      <FilterTabs
        options={options}
        selected={selectedType}
        onSelect={setSelectedType}
      />

      {selectedType === FilterType.SWAP && <Swap setTokenMint={setTokenMint} />}
      {selectedType === FilterType.PERPETUAL && <Perpetual />}
    </div>
  )
}
