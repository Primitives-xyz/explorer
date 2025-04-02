'use client'

import { Swap } from '@/components-new-version/swap/components/swap'
import { Perpetual } from '@/components-new-version/trade/left-content/perpetual/perpetual'
import { FilterTabs } from '@/components-new-version/ui'
import { useState } from 'react'

interface TradeLeftContentProps {
  mint: string
  setTokenMint: (value: string) => void
}

export enum FilterType {
  SWAP = 'swap',
  PERPETUAL = 'perpetual',
}

export function TradeLeftContent({
  mint,
  setTokenMint,
}: TradeLeftContentProps) {
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

      {selectedType === FilterType.SWAP && (
        <Swap mint={mint} setTokenMint={setTokenMint} />
      )}
      {selectedType === FilterType.PERPETUAL && <Perpetual />}
    </div>
  )
}
