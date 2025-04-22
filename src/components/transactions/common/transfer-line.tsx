import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { useTokenUSDCPrice } from '@/components/token/hooks/use-token-usdc-price'
import { abbreviateWalletAddress, formatNumber } from '@/utils/utils'
import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import Image from 'next/image'
import { cn } from '@/utils/utils'
import { Card } from '@/components/ui'

interface TransferLineProps {
  from: string
  to: string
  mint: string
  amount: number
  timestamp?: number
  compact?: boolean
  showTimestamp?: boolean
  showCopy?: boolean
  direction?: 'out' | 'in' | 'fee'
  className?: string
}

export function TransferLine({
  from,
  to,
  mint,
  amount,
  timestamp,
  compact = false,
  showTimestamp = true,
  showCopy = true,
  direction,
  className,
}: TransferLineProps) {
  const { symbol, image, decimals } = useTokenInfo(mint)
  const displaySymbol = symbol || abbreviateWalletAddress({ address: mint })
  const iconSize = compact ? 16 : 20
  const { price, loading: priceLoading } = useTokenUSDCPrice({
    tokenMint: !compact ? mint : null,
    decimals: !compact ? decimals ?? 6 : 0,
  })
  const usdValue = price !== null ? amount * price : null

  return (
    <div
      className={cn(
        'flex flex-row items-center w-full overflow-visible justify-between',
        compact && 'text-xs h-6',
        className
      )}
    >
      {/* Left side: transaction details */}
      <div className="flex flex-row items-center">
        <span
          className={cn(
            direction === 'out'
              ? 'text-destructive'
              : direction === 'in'
              ? 'text-primary'
              : 'text-muted-foreground',
            'font-medium mr-1',
          )}
        >
          Transfer
        </span>
        {/* Token image, amount, symbol, and USD price */}
        <span className="flex items-center mx-1">
          {image ? (
            <Image
              src={image}
              alt={displaySymbol || 'Token'}
              width={iconSize}
              height={iconSize}
              className="rounded-full object-cover mr-1"
            />
          ) : (
            <span className="font-mono text-xs mr-1">{mint.slice(0, 2)}</span>
          )}
          <span className="font-medium">{formatNumber(amount)}</span>
          <span className="ml-1">
            <SolanaAddressDisplay
              address={mint}
              displayText={displaySymbol}
              highlightable={true}
            />
          </span>
          {!compact && price !== null && !priceLoading && usdValue !== null && (
            <span className="ml-1 text-xs text-muted-foreground">
              (${formatNumber(usdValue)})
            </span>
          )}
        </span>
        <span className="mx-1">from</span>
        <SolanaAddressDisplay
          address={from}
          displayAbbreviatedAddress
          highlightable={true}
          showCopyButton={showCopy}
          className="inline-block text-xs ml-1 align-middle"
        />
        <span className="mx-1">to</span>
        <SolanaAddressDisplay
          address={to}
          displayAbbreviatedAddress
          highlightable={true}
          showCopyButton={showCopy}
          className="inline-block text-xs ml-1 align-middle"
        />
      </div>
      {/* Right side: timestamp */}
      <div className="flex flex-row items-center">
        {showTimestamp && timestamp && !compact && (
          <span className="text-xs text-muted-foreground ml-2">
            {new Date(timestamp * 1000).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  )
} 