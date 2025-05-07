import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import Image from 'next/image'
import { formatNumber } from '@/utils/utils'
import { cn } from '@/utils/utils'

interface SwapLineProps {
  signer: string
  amountA: number
  mintA: string
  amountB: number
  mintB: string
  intermediary: string
  timestamp?: number
  compact?: boolean
  showTimestamp?: boolean
  className?: string
}

export function SwapLine({
  signer,
  amountA,
  mintA,
  amountB,
  mintB,
  intermediary,
  timestamp,
  compact = false,
  showTimestamp = true,
  className,
}: SwapLineProps) {
  const { data: tokenDataA, image: imageA, decimals: decimalsA, symbol: symbolA, loading: loadingA } = useTokenInfo(mintA)
  const { data: tokenDataB, image: imageB, decimals: decimalsB, symbol: symbolB, loading: loadingB } = useTokenInfo(mintB)
  const iconSize = compact ? 16 : 20

  // Extract price from token info (like transfer-line.tsx)
  const priceA = tokenDataA?.result && 'token_info' in tokenDataA.result
    ? tokenDataA.result.token_info?.price_info?.price_per_token
    : null
  const priceB = tokenDataB?.result && 'token_info' in tokenDataB.result
    ? tokenDataB.result.token_info?.price_info?.price_per_token
    : null

  const usdValueA = priceA != null ? amountA * priceA : null
  const usdValueB = priceB != null ? amountB * priceB : null

  return (
    <div
      className={cn(
        'flex flex-row items-center w-full overflow-visible justify-between',
        compact && 'text-xs h-6',
        className
      )}
    >
      {/* Left side: swap details */}
      <div className="flex flex-row items-center">
        <span className="font-medium mr-1">SWAP</span>
        <span className="flex items-center mx-1">
          {imageA ? (
            <Image src={imageA} alt={symbolA || 'Token'} width={iconSize} height={iconSize} className="rounded-full object-cover mr-1" />
          ) : (
            <span className="font-mono text-xs mr-1">{mintA.slice(0, 2)}</span>
          )}
          <span className="font-medium">{formatNumber(amountA)}</span>
          <span className="ml-1"><SolanaAddressDisplay address={mintA} displayText={symbolA} highlightable={true} /></span>
          {!compact && priceA !== null && !loadingA && usdValueA !== null && (
            <span className="ml-1 text-xs text-muted-foreground">(${formatNumber(usdValueA)})</span>
          )}
        </span>
        <span className="mx-1">for</span>
        <span className="flex items-center mx-1">
          {imageB ? (
            <Image src={imageB} alt={symbolB || 'Token'} width={iconSize} height={iconSize} className="rounded-full object-cover mr-1" />
          ) : (
            <span className="font-mono text-xs mr-1">{mintB.slice(0, 2)}</span>
          )}
          <span className="font-medium">{formatNumber(amountB)}</span>
          <span className="ml-1"><SolanaAddressDisplay address={mintB} displayText={symbolB} highlightable={true} /></span>
          {!compact && priceB !== null && !loadingB && usdValueB !== null && (
            <span className="ml-1 text-xs text-muted-foreground">(${formatNumber(usdValueB)})</span>
          )}
        </span>
        <span className="mx-1">via</span>
        <SolanaAddressDisplay
          address={intermediary}
          displayAbbreviatedAddress
          highlightable={true}
          showCopyButton={true}
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