'use client'

import { TimeFrame } from '@/components-new-version/discover/hooks/use-top-traders'
import {
  Button,
  ButtonVariant,
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
  return (
    <div className="flex items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
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
        </div>
        <div>
          {selectedType === DiscoverFilterType.TOP_TRADERS && (
            <Select
              value={timeFrame}
              onValueChange={(value) => setTimeFrame(value as TimeFrame)}
            >
              <SelectTrigger className="border-none bg-transparent text-primary">
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
    </div>
  )
}
