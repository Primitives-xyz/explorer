'use client'

import {
  FilterTabs,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { useTranslations } from 'next-intl'
import { ETimeFrame } from '../birdeye/birdeye-top-traders.models'

export enum DiscoverFilterType {
  TRENDING_TOKENS = 'trending-tokens',
  TOP_TRADERS = 'top-traders',
}

interface Props {
  selectedType: DiscoverFilterType
  setSelectedType: (type: DiscoverFilterType) => void
  timeFrame: ETimeFrame
  setTimeFrame: (frame: ETimeFrame) => void
}

export function FilterButtonDiscover({
  selectedType,
  timeFrame,
  setSelectedType,
  setTimeFrame,
}: Props) {
  const t = useTranslations('discover.filters')

  const options = [
    { label: t('trending_tokens'), value: DiscoverFilterType.TRENDING_TOKENS },
    { label: t('top_traders'), value: DiscoverFilterType.TOP_TRADERS },
  ]

  return (
    <div className="flex items-center justify-between w-full">
      <FilterTabs
        options={options}
        selected={selectedType}
        onSelect={setSelectedType}
      />
      <div className="mb-4">
        {selectedType === DiscoverFilterType.TOP_TRADERS && (
          <Select
            value={timeFrame}
            onValueChange={(value) => setTimeFrame(value as ETimeFrame)}
          >
            <SelectTrigger className="border-none bg-transparent text-primary h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border border-primary text-primary">
              <SelectItem value={ETimeFrame.TODAY}>
                {t('time_frames.today')}
              </SelectItem>
              <SelectItem value={ETimeFrame.YESTERDAY}>
                {t('time_frames.yesterday')}
              </SelectItem>
              <SelectItem value={ETimeFrame.ONE_WEEK}>
                {t('time_frames.one_week')}
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
