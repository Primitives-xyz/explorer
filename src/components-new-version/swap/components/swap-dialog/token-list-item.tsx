'use client'

import { TokenSearchResult } from '@/components-new-version/swap/types/token-types'
import {
  formatMarketCap,
  formatPrice,
} from '@/components-new-version/swap/utils/token-utils'
import { Button, ButtonVariant } from '@/components-new-version/ui'
import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface TokenListItemProps {
  token: TokenSearchResult
  onSelect: (token: TokenSearchResult) => void
}

export function TokenListItem({ token, onSelect }: TokenListItemProps) {
  const t = useTranslations()

  // Format balance to a readable format
  const formattedBalance = token.uiAmount
    ? token.uiAmount.toLocaleString(undefined, {
        maximumFractionDigits: token.uiAmount > 1000 ? 2 : 4,
      })
    : null

  // Format value to a readable format
  const formattedValue = token.valueUsd
    ? `$${token.valueUsd.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}`
    : null

  return (
    <Button
      variant={ButtonVariant.GHOST}
      className="w-full p-3 flex items-center gap-3 text-left h-18"
      onClick={() => onSelect(token)}
    >
      <div className="relative w-8 h-8 shrink-0">
        {token.logoURI ? (
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={token.logoURI}
              alt={token.symbol}
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {(token.symbol || '??').slice(0, 2)}
            </span>
          </div>
        )}
        {token.verified && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
            <Check className="text-background" size={12} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{token.symbol}</span>
          <span className="text-sm truncate">{token.name}</span>
          {token.chainId && (
            <span className="text-xs px-1.5 py-0.5 rounded-full">
              {token.chainId}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="text-sm font-medium flex items-center gap-2">
            <span>{formatPrice(token.price || token.priceUsd || 0)}</span>
            {formattedBalance && (
              <span className="text-xs text-primary">
                {formattedBalance} {token.symbol}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs">
            {formattedValue ? (
              <span>{formattedValue}</span>
            ) : (
              <span className="font-medium">
                {t('common.m_cap')}:{' '}
                {formatMarketCap(token.market_cap, t('trade.no_m_cap'))}
              </span>
            )}
            {token.volume_24h_usd > 0 && (
              <>
                <span>•</span>
                <span>
                  {t('common.vol')}: $
                  {(token.volume_24h_usd / 1e6).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                  {t('common.m')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Button>
  )
}
