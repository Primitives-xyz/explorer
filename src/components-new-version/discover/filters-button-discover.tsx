'use client'

import { TimeFrame } from '@/components-new-version/discover/hooks/use-top-traders'
import { Button, ButtonVariant } from '@/components-new-version/ui'

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
  return (
    <div className="flex items-center gap-2">
      <div>
        <Button
          className="rounded-full"
          variant={
            selectedType === DiscoverFilterType.TRENDING_TOKENS
              ? ButtonVariant.DEFAULT
              : ButtonVariant.GHOST
          }
          onClick={() => setSelectedType(DiscoverFilterType.TRENDING_TOKENS)}
        >
          Trending Tokens
        </Button>
        <Button
          className="rounded-full"
          variant={
            selectedType === DiscoverFilterType.TOP_TRADERS
              ? ButtonVariant.DEFAULT
              : ButtonVariant.GHOST
          }
          onClick={() => setSelectedType(DiscoverFilterType.TOP_TRADERS)}
        >
          Top Traders
        </Button>
        <select
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
          className="bg-transparent text-sm border border-muted px-3 py-1 rounded-full focus:outline-none"
        >
          <option value={TimeFrame.TODAY}>Today</option>
          <option value={TimeFrame.YESTERDAY}>Yesterday</option>
          <option value={TimeFrame.ONE_WEEK}>1W</option>
        </select>
      </div>
    </div>
  )
}
