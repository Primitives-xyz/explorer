'use client'

import { useGetSearchTokens } from '@/components/birdeye/hooks/use-get-search-tokens'
import { route } from '@/components/utils/route'
import { formatNumber } from '@/components/utils/utils'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { SearchResultsEntry } from './search-results-entry'

interface Props {
  query: string
  closePopover: () => void
}

export function SearchResultsTokens({ query, closePopover }: Props) {
  const t = useTranslations()
  const { tokens, loading } = useGetSearchTokens({ query })

  const formatPrice = (price: number) => {
    if (price < 0.000001) return `$${price.toExponential(4)}`
    return `$${price.toLocaleString(undefined, {
      maximumFractionDigits: 6,
      minimumFractionDigits: 2,
    })}`
  }

  return (
    <div>
      <div className="flex items-center justify-between text-xs p-3">
        <h3>Tokens</h3>
        <span className="text-muted-foreground">Price</span>
      </div>
      <div>
        {tokens.map((entry) => (
          <SearchResultsEntry
            key={entry.address}
            image={
              <div className="w-8 h-8 relative">
                <div className="w-full h-full rounded-full bg-muted relative overflow-hidden">
                  {entry.logo_uri ? (
                    <Image
                      src={entry.logo_uri}
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
                {entry.verified && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center ring-1 ring-black">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                )}
              </div>
            }
            title={(entry.symbol + ' · ' + entry.name)
              .split(new RegExp(`(${query})`, 'i'))
              .map((part, index) => (
                <span
                  key={index}
                  className={
                    part.toLowerCase() === query.toLowerCase()
                      ? 'text-secondary font-semibold'
                      : ''
                  }
                >
                  {part}
                </span>
              ))}
            subtitle={
              <>
                {t('common.m_cap')}: {formatNumber(entry.market_cap)}
                {!!entry.volume_24h_usd && (
                  <>
                    {' '}
                    • {t('common.vol')}: ${formatNumber(entry.volume_24h_usd)}
                  </>
                )}
              </>
            }
            rightContent={entry.price ? formatPrice(entry.price) : undefined}
            href={route('entity', {
              id: entry.address,
            })}
            closePopover={closePopover}
          />
        ))}
        {tokens.length === 0 && !loading && (
          <div className="text-xs text-muted-foreground p-3">No results</div>
        )}
        {loading && (
          <div className="text-xs text-muted-foreground p-3 loading-dots">
            Loading
          </div>
        )}
      </div>
    </div>
  )
}
