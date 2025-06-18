'use client'

import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { SOL_MINT } from '@/utils/constants'
import { route } from '@/utils/route'
import { abbreviateWalletAddress, cn } from '@/utils/utils'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface TokenLineProps {
  mint: string
  amount: number
  type?: 'sent' | 'received'
  showUsd?: boolean
  compact?: boolean
  usdValue?: number | null
}

// Custom formatter for token amounts that removes trailing zeros
function formatTokenAmount(amount: number): string {
  if (amount === 0) return '0'

  // For very small numbers (considering Solana can have up to 9 decimals)
  if (amount < 0.000000001) {
    return '<0.000000001'
  }

  // For large numbers
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + 'B'
  }
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M'
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(2).replace(/\.?0+$/, '') + 'K'
  }

  // For numbers between 0.000000001 and 1000
  // Determine decimal places based on the number size
  let decimalPlaces = 2
  if (amount < 0.000001) decimalPlaces = 9
  else if (amount < 0.00001) decimalPlaces = 8
  else if (amount < 0.0001) decimalPlaces = 7
  else if (amount < 0.001) decimalPlaces = 6
  else if (amount < 0.01) decimalPlaces = 5
  else if (amount < 0.1) decimalPlaces = 4
  else if (amount < 1) decimalPlaces = 3

  // Format and remove trailing zeros
  return amount.toFixed(decimalPlaces).replace(/\.?0+$/, '')
}

export function TokenLine({
  mint,
  amount,
  type = 'sent',
  showUsd = false,
  compact = false,
  usdValue: providedUsdValue,
}: TokenLineProps) {
  const t = useTranslations()
  const isSol = mint === SOL_MINT
  const {
    data: tokenData,
    symbol,
    name,
    image,
    decimals,
    loading: tokenLoading,
  } = useTokenInfo(isSol ? null : mint)
  const router = useRouter()

  const displaySymbol = symbol || (isSol ? 'SOL' : undefined)

  const price =
    tokenData?.result && 'token_info' in tokenData.result
      ? tokenData.result.token_info?.price_info?.price_per_token ?? null
      : null

  // Use provided USD value if available, otherwise calculate from price
  const usdValue =
    providedUsdValue !== undefined
      ? providedUsdValue
      : price !== null
      ? amount * price
      : null

  const iconSize = compact ? 16 : 20

  const icon = isSol ? (
    <Image
      src="/images/solana-icon.svg"
      alt="solana icon"
      width={iconSize}
      height={iconSize}
      className="rounded-full object-cover aspect-square"
    />
  ) : image ? (
    <Image
      src={image}
      alt={displaySymbol || 'Token'}
      width={iconSize}
      height={iconSize}
      className="rounded-full object-cover aspect-square"
    />
  ) : (
    <span className="font-mono text-xs">{mint.slice(0, 2)}</span>
  )

  const handleTokenClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(route('entity', { id: mint }))
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 w-full overflow-visible',
        compact && 'text-xs h-6'
      )}
    >
      <div
        className={cn(
          compact ? 'w-4 h-4' : 'w-5 h-5',
          'rounded-full flex items-center justify-center overflow-hidden',
          'cursor-pointer hover:opacity-80'
        )}
        onClick={handleTokenClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleTokenClick(e as any)
        }}
        aria-label={`Go to token ${mint}`}
      >
        {icon}
      </div>

      <div className="flex flex-col min-w-0 overflow-visible">
        <div
          className={cn(
            'flex items-center gap-1 truncate',
            compact && 'leading-tight',
            'cursor-pointer hover:underline'
          )}
          onClick={handleTokenClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleTokenClick(e as any)
          }}
          aria-label={`Go to token ${mint}`}
        >
          <span className="font-medium truncate">
            {displaySymbol || abbreviateWalletAddress({ address: mint })}
          </span>
          {name && name !== displaySymbol && !compact && (
            <span className="text-xs text-muted-foreground truncate">
              ({name})
            </span>
          )}
        </div>
        {!compact && (
          <span
            className="text-xs text-muted-foreground relative cursor-pointer hover:underline"
            onClick={handleTokenClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleTokenClick(e as any)
            }}
            aria-label={`Go to token ${mint}`}
          >
            <SolanaAddressDisplay
              address={mint}
              displayAbbreviatedAddress
              highlightable={true}
              showCopyButton={true}
              className="text-xs"
            />
          </span>
        )}
      </div>

      <div className="ml-auto text-right">
        <div
          className={cn(
            type === 'sent' ? 'text-destructive' : 'text-primary',
            'font-medium'
          )}
        >
          {type === 'sent' ? '-' : '+'}
          {formatTokenAmount(amount)}
        </div>
        {showUsd && !compact && (
          <span className="text-xs text-muted-foreground block">
            {tokenLoading
              ? t('common.loading')
              : usdValue !== null
              ? `$${formatTokenAmount(usdValue)}`
              : ''}
          </span>
        )}
      </div>
    </div>
  )
}
