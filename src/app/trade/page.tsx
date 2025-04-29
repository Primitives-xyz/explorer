'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import {
  FilterType,
  TradeLeftContent,
} from '@/components/trade/left-content/trade-left-content'
import { TradeContent } from '@/components/trade/trade-content/trade-content'
import { useState } from 'react'

export default function TradePage() {
  const [tokenMint, setTokenMint] = useState<string>('')
  const [selectedType, setSelectedType] = useState<FilterType>(FilterType.SWAP)

  return (
    <MainContentWrapper className="flex flex-col md:flex-row w-full gap-6 pb-10">
      <TradeLeftContent
        setTokenMint={setTokenMint}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />
      <TradeContent id={tokenMint} selectedType={selectedType} />
    </MainContentWrapper>
  )
}
