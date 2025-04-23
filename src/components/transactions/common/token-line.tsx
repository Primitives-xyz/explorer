'use client'

import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { useTokenUSDCPrice } from '@/components/token/hooks/use-token-usdc-price'
import { SOL_MINT } from '@/utils/constants'
import { abbreviateWalletAddress, formatNumber } from '@/utils/utils'
import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import Image from 'next/image'
import { cn } from '@/utils/utils'

interface TokenLineProps {
  mint: string
  amount: number
  type?: 'sent' | 'received'
  showUsd?: boolean
  compact?: boolean
}

export function TokenLine({
  mint,
  amount,
  type = 'sent',
  showUsd = true,
  compact = false,
}: TokenLineProps) {
  const isSol = mint === SOL_MINT
  const { symbol, name, image, decimals } = useTokenInfo(isSol ? null : mint)

  const displaySymbol = symbol || (isSol ? 'SOL' : undefined)

  const priceDecimals = isSol ? 9 : decimals ?? 6
  const { price, loading: priceLoading } = useTokenUSDCPrice({
    tokenMint: showUsd ? mint : null,
    decimals: showUsd ? priceDecimals : 0,
  })

  const usdValue = price !== null ? amount * price : null

  const iconSize = compact ? 16 : 20

  const icon = isSol ? (
    <Image
      src="/images/solana-icon.svg"
      alt="solana icon"
      width={iconSize}
      height={iconSize}
      className="rounded-full object-cover"
    />
  ) : image ? (
    <Image
      src={image}
      alt={displaySymbol || 'Token'}
      width={iconSize}
      height={iconSize}
      className="rounded-full object-cover"
    />
  ) : (
    <span className="font-mono text-xs">{mint.slice(0, 2)}</span>
  )

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
          'rounded-full flex items-center justify-center overflow-hidden'
        )}
      >
        {icon}
      </div>

      <div className="flex flex-col min-w-0 overflow-visible">
        <div className={cn('flex items-center gap-1 truncate', compact && 'leading-tight')}>
          <span className="font-medium truncate">
            {displaySymbol || abbreviateWalletAddress({ address: mint })}
          </span>
          {name && name !== displaySymbol && !compact && (
            <span className="text-xs text-muted-foreground truncate">({name})</span>
          )}
        </div>
        {!compact && (
          <span className="text-xs text-muted-foreground relative">
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
          {formatNumber(amount)}
        </div>
        {showUsd && !compact && (
          <span className="text-xs text-muted-foreground block">
            {priceLoading
              ? 'Loading...'
              : usdValue !== null
              ? `$${formatNumber(usdValue)}`
              : ''}
          </span>
        )}
      </div>
    </div>
  )
} 