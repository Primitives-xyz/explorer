'use client'

import { ETimeFrame } from '@/components-new-version/birdeye/birdeye-top-traders.models'
import { useGetTopTraders } from '@/components-new-version/birdeye/hooks/use-get-top-traders'
import { route } from '@/components-new-version/utils/route'
import { abbreviateWalletAddress } from '@/components-new-version/utils/utils'
import { SEARCH_RESULTS_LIMIT } from './search-button'
import { SearchResultsEntry } from './search-results-entry'

interface Props {
  closePopover: () => void
}

export function SearchTopTraders({ closePopover }: Props) {
  const { traders } = useGetTopTraders({
    timeFrame: ETimeFrame.TODAY,
    limit: SEARCH_RESULTS_LIMIT,
  })

  return (
    <div>
      <div className="flex items-center justify-between text-xs p-3">
        <h3>Top Traders</h3>
        <span className="text-muted-foreground">PNL/Trade</span>
      </div>
      <div>
        {traders.map((entry, index) => (
          <SearchResultsEntry
            key={entry.address}
            image={
              <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-semibold">
                #{index + 1}
              </div>
            }
            title={abbreviateWalletAddress({
              address: entry.address,
            })}
            subtitle={
              <>
                {entry.formattedPnl} • Vol {entry.formattedVolume} • Trades{' '}
                {entry.formattedTradeCount}
              </>
            }
            rightContent={entry.formattedPnlPerTrade}
            href={route('entity', {
              id: entry.address,
            })}
            closePopover={closePopover}
          />
        ))}
      </div>
    </div>
  )
}
