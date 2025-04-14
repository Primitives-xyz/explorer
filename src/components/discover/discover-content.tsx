'use client'

import {
  DiscoverFilterType,
  FilterButtonDiscover,
} from '@/components/discover/filters-button-discover'
import { TopTraders } from '@/components/discover/top-traders'
import { TrendingTokens } from '@/components/discover/trending-tokens'
import { useState } from 'react'
import { ETimeFrame } from '../birdeye/birdeye-top-traders.models'

export function DiscoverContent() {
  const [selectedType, setSelectedType] = useState<DiscoverFilterType>(
    DiscoverFilterType.TRENDING_TOKENS
  )
  const [timeFrame, setTimeFrame] = useState<ETimeFrame>(ETimeFrame.TODAY)

  return (
    <div className="flex flex-col w-full">
      <FilterButtonDiscover
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        timeFrame={timeFrame}
        setTimeFrame={setTimeFrame}
      />
      {selectedType === DiscoverFilterType.TRENDING_TOKENS && (
        <TrendingTokens />
      )}
      {selectedType === DiscoverFilterType.TOP_TRADERS && (
        <TopTraders timeFrame={timeFrame} />
      )}
    </div>
  )
}
