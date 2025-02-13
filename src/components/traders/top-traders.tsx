'use client'

import { formatNumber } from '@/utils/format'
import type { VirtualItem } from '@tanstack/react-virtual'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useTranslations } from 'next-intl'
import { memo, useEffect, useRef, useState } from 'react'
import { WalletFollowButton } from '../profile/wallet-follow-button'
import { TokenAddress } from '../tokens/token-address'

interface Trader {
  network: string
  address: string
  pnl: number
  trade_count: number
  volume: number
}

// Memoized stat card to prevent unnecessary re-renders
const StatCard = memo(
  ({
    label,
    value,
    additionalInfo,
    color,
    className,
  }: {
    label: string
    value: string | number
    additionalInfo?: string
    color?: string
    className?: string
  }) => (
    <div
      className={`bg-black/30 p-1.5 sm:p-2 rounded-lg border border-indigo-800/30 hover:border-indigo-500/50 transition-all h-[60px] sm:h-[70px] flex flex-col ${
        className || ''
      }`}
    >
      <div className="flex flex-col flex-1 min-w-0">
        <div className="text-indigo-400 text-[10px]">{label}</div>
        <div
          className={`font-mono text-xs sm:text-sm font-medium truncate mt-0.5 ${
            color || 'text-white'
          }`}
        >
          {value}
        </div>
      </div>
      {additionalInfo && (
        <div className="text-indigo-400/60 text-[8px] sm:text-[10px] leading-tight break-words w-full truncate">
          {additionalInfo}
        </div>
      )}
    </div>
  )
)

StatCard.displayName = 'StatCard'

// Memoized trader card component
const TraderCard = memo(
  ({
    trader,
    index,
    isSelected,
    onClick,
  }: {
    trader: Trader
    index: number
    isSelected: boolean
    onClick: () => void
  }) => {
    const t = useTranslations()
    // Only calculate avgTradeSize if both volume and trade_count are greater than 0
    const avgTradeSize =
      trader.volume > 0 && trader.trade_count > 0
        ? trader.volume / trader.trade_count
        : 0

    // Calculate PNL per trade only if trade_count is greater than 0
    const pnlPerTrade =
      trader.trade_count > 0 ? trader.pnl / trader.trade_count : trader.pnl // If no trades, show total PNL

    return (
      <div
        className={`p-3 transition-all duration-200 cursor-pointer ${
          isSelected ? 'bg-indigo-900/20' : 'hover:bg-indigo-900/10'
        }`}
        onClick={onClick}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3">
            {/* Rank Badge */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
                  index === 0
                    ? 'bg-yellow-500/20 ring-yellow-500/50'
                    : index === 1
                    ? 'bg-gray-300/20 ring-gray-300/50'
                    : index === 2
                    ? 'bg-amber-600/20 ring-amber-600/50'
                    : 'bg-indigo-900/20 ring-indigo-500/20'
                } ring-1`}
              >
                <div
                  className={`font-mono text-base sm:text-lg font-bold ${
                    index === 0
                      ? 'text-yellow-500'
                      : index === 1
                      ? 'text-gray-300'
                      : index === 2
                      ? 'text-amber-600'
                      : 'text-indigo-400'
                  }`}
                >
                  #{index + 1}
                </div>
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-black text-[10px] sm:text-xs">⚡</span>
              </div>
            </div>

            {/* Trader Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {/* Desktop Layout */}
                <div className="hidden sm:flex flex-1 items-center justify-between min-w-0">
                  <div className="min-w-0">
                    <TokenAddress address={trader.address} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        trader.pnl >= 0
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      } shrink-0`}
                    >
                      {trader.pnl >= 0 ? '▲' : '▼'} $
                      {formatNumber(Math.abs(trader.pnl))}
                    </div>
                    <WalletFollowButton
                      walletAddress={trader.address}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="flex sm:hidden flex-1 items-center justify-between min-w-0">
                  <div className="min-w-0">
                    <TokenAddress address={trader.address} />
                  </div>
                  <div
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      trader.pnl >= 0
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    } shrink-0`}
                  >
                    {trader.pnl >= 0 ? '▲' : '▼'} $
                    {formatNumber(Math.abs(trader.pnl))}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-1.5">
                <StatCard
                  label={t('top_traders.pnl_trade')}
                  value={
                    trader.trade_count > 0
                      ? `$${formatNumber(Math.abs(pnlPerTrade))}`
                      : trader.pnl !== 0
                      ? t('top_traders.unrealized')
                      : t('top_traders.no_trades')
                  }
                  additionalInfo={
                    trader.trade_count > 0
                      ? t('top_traders.average_profit_per_trade')
                      : trader.pnl !== 0
                      ? `$${formatNumber(Math.abs(trader.pnl))} ${t(
                          'common.total'
                        )}`
                      : t('top_traders.no_trading_activity')
                  }
                  color={trader.pnl >= 0 ? 'text-green-400' : 'text-red-400'}
                />
                <StatCard
                  label={t('top_traders.volume')}
                  value={
                    trader.volume > 0
                      ? `$${formatNumber(trader.volume)}`
                      : trader.pnl !== 0
                      ? t('top_traders.holding')
                      : t('top_traders.no_volume')
                  }
                  additionalInfo={
                    trader.volume > 0
                      ? t('top_traders.total_trading_volume')
                      : trader.pnl !== 0
                      ? t('top_traders.position_value_change')
                      : t('top_traders.no_trading_activity')
                  }
                />
                <StatCard
                  label={t('top_traders.trades')}
                  value={
                    trader.trade_count > 0
                      ? formatNumber(trader.trade_count)
                      : trader.pnl !== 0
                      ? t('top_traders.holding')
                      : '0'
                  }
                  additionalInfo={
                    trader.trade_count > 0
                      ? `${t('top_traders.avg_size')} $${formatNumber(
                          avgTradeSize
                        )}`
                      : trader.pnl !== 0
                      ? t('top_traders.position_based_pnl')
                      : t('top_traders.no_trades_yet')
                  }
                />
              </div>
            </div>
          </div>

          {/* Mobile Follow Button */}
          <div className="sm:hidden flex justify-center">
            <div className="w-full max-w-[200px]  hover:bg-indigo-900/40 transition-colors rounded-lg">
              <WalletFollowButton walletAddress={trader.address} size="sm" />
            </div>
          </div>
        </div>
      </div>
    )
  }
)

TraderCard.displayName = 'TraderCard'

export const TopTraders = () => {
  const [traders, setTraders] = useState<Trader[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null)
  const t = useTranslations()

  const filter = [
    {
      value: 'today',
      label: t('top_traders.today'),
    },
    {
      value: 'yesterday',
      label: t('top_traders.yesterday'),
    },
    {
      value: '1W',
      label: t('top_traders.1w'),
    },
  ]
  const [timeFrame, setTimeFrame] = useState(filter[0].value)

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Set up virtualization
  const rowVirtualizer = useVirtualizer({
    count: traders.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 200, // Estimated height of each trader card
    overscan: 3, // Number of items to render outside the visible area
  })

  // Move API options outside useEffect to avoid dependency warning
  const apiOptions = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'x-chain': 'solana',
      'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '',
    },
  }

  useEffect(() => {
    const fetchTopTraders = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(
          `https://public-api.birdeye.so/trader/gainers-losers?type=${timeFrame}&sort_by=PnL&sort_type=desc&offset=0&limit=10`,
          apiOptions
        )

        if (!response.ok) {
          throw new Error(
            `${t('error.failed_to_fetch_top_traders')} ${response.status} ${
              response.statusText
            }`
          )
        }

        const data = await response.json()
        if (!data.success) {
          throw new Error(
            `${t('error.api_request_failed')} ${
              data.message || t('error.unknown_error')
            }`
          )
        }

        setTraders(data.data.items)
      } catch (err) {
        console.error(t('error.error_fetching_top_traders'), err)
        setError(
          err instanceof Error
            ? err.message
            : t('error.failed_to_fetch_traders')
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopTraders()
  }, [timeFrame]) // apiOptions is now stable and doesn't need to be in dependencies

  return (
    <div className="border border-indigo-800 bg-black/50 w-full overflow-hidden flex flex-col h-[600px] relative group backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-indigo-800 p-3 flex-shrink-0 bg-black/20">
        {/* Mobile Layout */}
        <div className="flex sm:hidden flex-col gap-2">
          <div className="text-indigo-500 text-sm font-mono flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            {'>'} {t('top_traders.title')}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filter.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeFrame(tf.value)}
                className={`text-xs font-mono px-2.5 py-1 rounded-full transition-all uppercase ${
                  timeFrame === tf.value
                    ? 'bg-indigo-500 text-black'
                    : 'text-indigo-400 bg-indigo-900/20 hover:bg-indigo-900/40'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="text-indigo-500 text-sm font-mono flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            {'>'} {t('top_traders.title')}
          </div>
          <div className="flex gap-2">
            {filter.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeFrame(tf.value)}
                className={`text-xs font-mono px-3 py-1 rounded-full transition-all uppercase ${
                  timeFrame === tf.value
                    ? 'bg-indigo-500 text-black'
                    : 'text-indigo-400 bg-indigo-900/20 hover:bg-indigo-900/40'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 m-4 text-red-400 text-sm border border-red-900/50 rounded-lg bg-red-900/10">
          <div className="flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            {t('common.error')}: {error}
          </div>
        </div>
      )}

      {/* Content */}
      <div
        ref={scrollContainerRef}
        className="overflow-y-auto flex-grow scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-indigo-900/50"
      >
        {isLoading ? (
          <div className="p-8 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-indigo-600 font-mono animate-pulse">
              {`>>> ${t('top_traders.analyzing_trader_performance')}...`}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-indigo-800/30">
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer
                .getVirtualItems()
                .map((virtualRow: VirtualItem) => {
                  const trader = traders[virtualRow.index]
                  if (!trader) return null
                  return (
                    <div
                      key={trader.address}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <TraderCard
                        trader={trader}
                        index={virtualRow.index}
                        isSelected={selectedTrader?.address === trader.address}
                        onClick={() =>
                          setSelectedTrader(
                            selectedTrader?.address === trader.address
                              ? null
                              : trader
                          )
                        }
                      />
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>

      {/* Scroll Progress Indicator */}
      <div className="absolute right-2 top-[48px] bottom-2 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="h-full bg-indigo-500/5 rounded-full">
          <div className="h-24 w-full bg-indigo-500/20 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}
