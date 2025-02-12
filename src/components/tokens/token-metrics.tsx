import type { BirdeyeTokenOverview } from '@/hooks/use-birdeye-token-overview'
import { formatNumber } from '@/utils/format'
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/solid'

interface TokenMetricsProps {
  overview: BirdeyeTokenOverview
}

// Helper function to format price with appropriate decimals
const formatPrice = (price: number) => {
  if (price < 0.000001) return price.toFixed(12)
  if (price < 0.00001) return price.toFixed(10)
  if (price < 0.0001) return price.toFixed(9)
  if (price < 0.001) return price.toFixed(8)
  if (price < 0.01) return price.toFixed(7)
  return formatNumber(price, 6)
}

export function TokenMetrics({ overview }: TokenMetricsProps) {
  const metrics = [
    {
      label: 'Price',
      value: `$${formatPrice(overview.price)}`,
      change: overview.priceChange24hPercent,
      changeLabel: '24h',
    },
    {
      label: 'Market Cap',
      value: `$${formatNumber(overview.realMc)}`,
    },
    {
      label: 'Liquidity',
      value: `$${formatNumber(overview.liquidity)}`,
    },
    {
      label: '24h Volume',
      value: `$${formatNumber(overview.v24hUSD)}`,
    },
    {
      label: 'Holders',
      value: formatNumber(overview.holder),
    },
    {
      label: 'Active Wallets (24h)',
      value: formatNumber(overview.uniqueWallet24h),
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="flex flex-col p-4 bg-black/20 border border-green-800/40 rounded-xl hover:border-green-500/40 transition-colors"
        >
          <span className="text-green-500/60 text-sm font-mono mb-1">
            {metric.label}
          </span>
          <span className="text-xl font-bold text-green-400 font-mono">
            {metric.value}
          </span>
          {metric.change !== undefined && (
            <div
              className={`flex items-center gap-1 mt-1 ${
                metric.change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {metric.change >= 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4" />
              )}
              <span className="text-sm font-mono">
                {formatNumber(Math.abs(metric.change), 2)}% {metric.changeLabel}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
