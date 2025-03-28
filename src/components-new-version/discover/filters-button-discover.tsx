'use client'

import { FilterTabs } from '@/components-new-version/common/filter-tabs'
import { TimeFrame } from '@/components-new-version/discover/hooks/use-top-traders'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components-new-version/ui'

export enum DiscoverFilterType {
  TRENDING_TOKENS = 'trending-tokens',
  TOP_TRADERS = 'top-traders',
}

interface Props {
  selectedType: DiscoverFilterType
  setSelectedType: (type: DiscoverFilterType) => void
  timeFrame: TimeFrame
  setTimeFrame: (frame: TimeFrame) => void
}

export function FilterButtonDiscover({
  selectedType,
  setSelectedType,
  timeFrame,
  setTimeFrame,
}: Props) {
  const options = [
    { label: 'Trending Tokens', value: DiscoverFilterType.TRENDING_TOKENS },
    { label: 'Top Traders', value: DiscoverFilterType.TOP_TRADERS },
  ]

  return (
    <div className="flex items-center justify-between w-full">
      <FilterTabs
        options={options}
        selected={selectedType}
        onSelect={setSelectedType}
      />
      <div>
        {selectedType === DiscoverFilterType.TOP_TRADERS && (
          <Select
            value={timeFrame}
            onValueChange={(value) => setTimeFrame(value as TimeFrame)}
          >
            <SelectTrigger className="border-none bg-transparent text-primary h-9">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent className="border border-primary text-primary">
              <SelectItem value={TimeFrame.TODAY}>Today</SelectItem>
              <SelectItem value={TimeFrame.YESTERDAY}>Yesterday</SelectItem>
              <SelectItem value={TimeFrame.ONE_WEEK}>1W</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
