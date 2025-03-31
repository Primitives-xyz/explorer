'use client'

import {
  DiscoverFilterType,
  FilterButtonDiscover,
} from '@/components-new-version/discover/filters-button-discover'
import { TimeFrame } from '@/components-new-version/discover/hooks/use-top-traders'
import { TopTraders } from '@/components-new-version/discover/top-traders'
import { TrendingTokens } from '@/components-new-version/discover/trending-tokens'
import { useState } from 'react'

export function DiscoverContent() {
  const [selectedType, setSelectedType] = useState<DiscoverFilterType>(
    DiscoverFilterType.TRENDING_TOKENS
  )

  const [timeFrame, setTimeFrame] = useState<TimeFrame>(TimeFrame.TODAY)

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
