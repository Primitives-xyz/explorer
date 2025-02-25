import { Skeleton } from '@/components/ui/skeleton'

interface TokenMetricsProps {
  price?: number
  priceChange24h?: number
  liquidity?: number
  volume24h?: number
  marketCap?: number
  holders?: number
  isLoading: boolean
}

export function TokenMetrics({
  price,
  priceChange24h,
  liquidity,
  volume24h,
  marketCap,
  holders,
  isLoading,
}: TokenMetricsProps) {
  // Format price with appropriate decimal places
  const formatPrice = (price?: number) => {
    if (!price) return 'N/A'

    // For very small numbers, use scientific notation
    if (price < 0.0001) {
      return price.toExponential(2)
    }

    // For small numbers (but not too small), show more decimals
    if (price < 0.01) {
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }

    // For regular numbers
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Format large numbers (M, B, T)
  const formatLargeNumber = (num?: number) => {
    if (!num) return 'N/A'
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return `$${num.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto mt-4 md:mt-0">
        <Skeleton className="h-24 w-full bg-green-900/20" />
        <Skeleton className="h-24 w-full bg-green-900/20" />
        <Skeleton className="h-24 w-full bg-green-900/20 hidden md:block" />
        <Skeleton className="h-24 w-full bg-green-900/20 hidden md:block" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto mt-4 md:mt-0">
      {/* Price Card */}
      <div className="bg-black/40 border border-green-800/40 rounded-lg p-3">
        <div className="text-sm text-gray-400">Price</div>
        <div className="text-xl font-bold font-mono text-green-400">
          ${formatPrice(price)}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span
            className={
              (priceChange24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'
            }
          >
            {(priceChange24h || 0) >= 0 ? '+' : ''}
            {priceChange24h?.toFixed(2) || '0.00'}%
          </span>
          <span className="text-gray-400">(24h)</span>
        </div>
      </div>

      {/* Market Cap Card */}
      <div className="bg-black/40 border border-green-800/40 rounded-lg p-3">
        <div className="text-sm text-gray-400 md:whitespace-nowrap">
          Market Cap
        </div>
        <div className="text-xl font-bold font-mono text-green-400">
          {formatLargeNumber(marketCap)}
        </div>
      </div>

      {/* 24h Volume Card */}
      <div className="bg-black/40 border border-green-800/40 rounded-lg p-3 hidden md:block">
        <div className="text-sm text-gray-400 md:whitespace-nowrap">
          24h Volume
        </div>
        <div className="text-xl font-bold font-mono text-green-400">
          {formatLargeNumber(volume24h)}
        </div>
      </div>

      {/* Liquidity Card */}
      <div className="bg-black/40 border border-green-800/40 rounded-lg p-3 hidden md:block">
        <div className="text-sm text-gray-400">Liquidity</div>
        <div className="text-xl font-bold font-mono text-green-400">
          {formatLargeNumber(liquidity)}
        </div>
      </div>

      {/* Mobile-only Volume Card */}
      <div className="bg-black/40 border border-green-800/40 rounded-lg p-3 md:hidden">
        <div className="text-sm text-gray-400">24h</div>
        <div className="text-sm text-gray-400">Volume</div>
        <div className="text-xl font-bold font-mono text-green-400">
          {formatLargeNumber(volume24h)}
        </div>
      </div>
    </div>
  )
}
