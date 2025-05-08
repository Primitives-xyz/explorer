'use client'

import { Swap } from '@/components/swap/components/swap'
// import { Perpetual } from '@/components/trade/left-content/perpetual/perpetual'
import { FilterTabs } from '@/components/ui'
import { useEffect, useState } from 'react'
import { Perpetual } from './perpetual/updated-perpetual'

interface TradeLeftContentProps {
  selectedType: FilterType
  setTokenMint: (value: string) => void
  setSelectedType: (value: FilterType) => void
}

export enum FilterType {
  SWAP = 'swap',
  PERPETUAL = 'perpetual',
}

export function TradeLeftContent({
  selectedType,
  setTokenMint,
  setSelectedType,
}: TradeLeftContentProps) {
  const options = [
    { label: 'Swap', value: FilterType.SWAP },
    { label: 'Perpetual', value: FilterType.PERPETUAL },
  ]

  return (
    <div className="w-full md:w-1/3">
      <FilterTabs
        options={options}
        selected={selectedType}
        onSelect={setSelectedType}
        buttonClassName="flex-1 md:flex-none"
      />
      {selectedType === FilterType.SWAP && <Swap setTokenMint={setTokenMint} />}
      {selectedType === FilterType.PERPETUAL && (
        <Perpetual setTokenMint={setTokenMint} />
      )}
    </div>
  )
}
