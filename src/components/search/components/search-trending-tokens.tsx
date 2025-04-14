'use client'

import { useGetTrendingTokens } from '@/components/birdeye/hooks/use-get-trending-tokens'
import { route } from '@/components/utils/route'
import { abbreviateWalletAddress, formatNumber } from '@/components/utils/utils'
import Image from 'next/image'
import { SEARCH_RESULTS_LIMIT } from './search-button'
import { SearchResultsEntry } from './search-results-entry'

interface Props {
  closePopover: () => void
}

export function SearchTrendingTokens({ closePopover }: Props) {
  const { tokens } = useGetTrendingTokens({
    limit: SEARCH_RESULTS_LIMIT,
  })

  return (
    <div>
      <div className="flex items-center justify-between text-xs p-3">
        <h3>Trending Tokens</h3>
        <span className="text-muted-foreground">24h Vol</span>
      </div>
      <div>
        {tokens.map((entry, index) => (
          <SearchResultsEntry
            key={entry.address}
            image={
              <div className="w-8 h-8 rounded-full bg-muted relative overflow-hidden">
                {entry.logoURI ? (
                  <Image
                    src={entry.logoURI}
                    alt={`${entry.symbol} logo`}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {entry.symbol.slice(0, 2)}
                  </div>
                )}
              </div>
            }
            title={abbreviateWalletAddress({
              address: entry.address,
            })}
            subtitle={
              <>
                Liq {formatNumber(entry.liquidity)} • Price{' '}
                {formatNumber(entry.price)}
              </>
            }
            rightContent={formatNumber(entry.volume24hUSD)}
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
