'use client'

import { ITokenSearchResult } from '@/components/swap/swap.models'
import {
  formatMarketCap,
  formatPrice,
} from '@/components/swap/utils/token-utils'
import { Button, ButtonVariant } from '@/components/ui'
import { Check, CheckIcon, CopyIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import useClipboard from 'react-use-clipboard'

interface TokenListItemProps {
  token: ITokenSearchResult
  onSelect: (token: ITokenSearchResult) => void
}

export function TokenListItem({ token, onSelect }: TokenListItemProps) {
  const t = useTranslations()
  const [isCopied, setCopied] = useClipboard(token.address, {
    successDuration: 2000,
  })

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

  useEffect(() => {
    console.log('token', token)
  }, [token])

  return (
    <Button
      variant={ButtonVariant.GHOST}
      className="w-full p-3 flex items-center gap-3 text-left h-18 my-4"
      onClick={() => onSelect(token)}
    >
      <div className="relative w-8 h-8 shrink-0">
        {token.logoURI ? (
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={token.logoURI}
              alt={token.symbol}
              width={48}
              height={48}
              className="rounded-full"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">
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
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{token.symbol}</span>
          <span className="text-xs truncate">{token.name}</span>
          {token.chainId && (
            <span className="text-xs px-1.5 py-0.5 rounded-full">
              {token.chainId}
            </span>
          )}
        </div>

        <div className="text-xs font-medium flex items-center gap-2">
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

        <div className="flex gap-2">
          <span className="text-xs">
            {token.address.slice(0, 5)}...{token.address.slice(-5)}
          </span>
          <Button
            variant={ButtonVariant.GHOST}
            onClick={(e) => {
              e.stopPropagation()
              setCopied()
            }}
            className="h-4 w-4 p-0"
          >
            {isCopied ? (
              <CheckIcon className="h-3 w-3 text-primary" />
            ) : (
              <CopyIcon className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </Button>
  )
}
