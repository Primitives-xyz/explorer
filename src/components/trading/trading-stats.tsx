'use client'
import { formatNumber } from '@/utils/format'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

interface TradingStatsProps {
  walletAddress: string
  hideTitle?: boolean
}

interface Trade {
  quote: {
    symbol: string
    decimals: number
    address: string
    amount: number
    type: string
    type_swap: string
    ui_amount: number
    price: number | null
    nearest_price: number
    change_amount: number
    ui_change_amount: number
  }
  base: {
    symbol: string
    decimals: number
    address: string
    amount: number
    type: string
    type_swap: string
    fee_info: null
    ui_amount: number
    price: number | null
    nearest_price: number
    change_amount: number
    ui_change_amount: number
  }
  base_price: number | null
  quote_price: number | null
  tx_hash: string
  source: string
  block_unix_time: number
  tx_type: string
  address: string
  owner: string
}

interface TradeResponse {
  success: boolean
  message?: string
  has_next: boolean
  data: {
    items: Trade[]
  }
}

interface TokenVolume {
  volume: number
  trades: number
}

interface TradingStats {
  totalTrades: number
  totalVolume: number
  pnl: number
  winningTrades: number
  losingTrades: number
  largestWin: number
  largestLoss: number
  tokenVolumes: Map<string, TokenVolume>
}

export const TradingStats = ({
  walletAddress,
  hideTitle = false,
}: TradingStatsProps) => {
  const [_trades, setTrades] = useState<Trade[]>([])
  const [stats, setStats] = useState<TradingStats>({
    totalTrades: 0,
    totalVolume: 0,
    pnl: 0,
    winningTrades: 0,
    losingTrades: 0,
    largestWin: 0,
    largestLoss: 0,
    tokenVolumes: new Map(),
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const t = useTranslations()

  const timePeriodTab = [
    { value: '1d', label: t('trade.1d') },
    { value: 'yesterday', label: t('trade.yesterday') },
    { value: '7d', label: t('trade.7d') },
  ]

  const [timePeriod, setTimePeriod] = useState('7d')

  useEffect(() => {
    const fetchTrades = async () => {
      if (!walletAddress) return

      setIsLoading(true)
      setError(null)

      try {
        const now = Math.floor(Date.now() / 1000)
        const oneDaySeconds = 24 * 60 * 60
        let yesterdayStart: number | null = null

        let afterTime: number

        switch (timePeriod) {
          case '1d':
            afterTime = now - oneDaySeconds
            break
          case 'yesterday':
            yesterdayStart = now - 2 * oneDaySeconds
            afterTime = yesterdayStart
            break
          case '7d':
            afterTime = now - 7 * oneDaySeconds
            break
          default:
            afterTime = now - 7 * oneDaySeconds
        }

        let allTrades: Trade[] = []
        let hasMore = true
        let lastTimestamp = afterTime
        const limit = 100
        let totalFetched = 0

        while (hasMore) {
          const options = {
            method: 'GET',
            headers: {
              accept: 'application/json',
              'x-chain': 'solana',
              'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '',
            },
          }

          const apiUrl = `https://public-api.birdeye.so/trader/txs/seek_by_time?address=${walletAddress}&limit=${limit}&tx_type=swap&after_time=${lastTimestamp}`

          const response = await fetch(apiUrl, options)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data: TradeResponse = await response.json()

          if (!data.success) {
            throw new Error(data.message || t('error.failed_to_fetch_trades'))
          }

          if (data.data.items.length > 0) {
            allTrades = [...allTrades, ...data.data.items]
            // Update the timestamp to fetch the next batch
            lastTimestamp =
              data.data.items[data.data.items.length - 1]?.block_unix_time ||
              lastTimestamp
            totalFetched += data.data.items.length
          }

          // Continue if we got a full batch (meaning there might be more) and haven't hit the limit
          // Note: has_next might be undefined, so we rely on batch size instead
          hasMore =
            data.data.items.length === limit &&
            totalFetched < 1000 &&
            lastTimestamp > afterTime // ensure we don't go beyond our time period

          if (hasMore) {
            // Add a small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 500))
          }
        }

        let filteredTrades = allTrades
        if (timePeriod === 'yesterday' && yesterdayStart !== null) {
          const yesterdayEnd = yesterdayStart + oneDaySeconds
          filteredTrades = allTrades.filter(
            (trade) =>
              //@ts-ignore
              trade.block_unix_time >= yesterdayStart &&
              trade.block_unix_time < yesterdayEnd
          )
        }

        setTrades(filteredTrades)

        const stats = filteredTrades.reduce(
          (acc, trade) => {
            const baseUsdValue =
              trade.base.ui_amount * (trade.base.nearest_price || 0)
            const quoteUsdValue =
              trade.quote.ui_amount * (trade.quote.nearest_price || 0)

            const isFromQuote = trade.quote.type_swap === 'from'
            const tradePnL = isFromQuote
              ? baseUsdValue - quoteUsdValue
              : quoteUsdValue - baseUsdValue

            for (const token of [trade.quote.symbol, trade.base.symbol]) {
              if (!token) continue
              const current = acc.tokenVolumes.get(token) || {
                volume: 0,
                trades: 0,
              }
              const isQuote = token === trade.quote.symbol
              const tokenValue = isQuote ? quoteUsdValue : baseUsdValue
              if (!isNaN(tokenValue)) {
                acc.tokenVolumes.set(token, {
                  volume: current.volume + tokenValue,
                  trades: current.trades + 1,
                })
              }
            }

            acc.totalTrades += 1
            const tradeVolume = Math.max(baseUsdValue || 0, quoteUsdValue || 0)
            if (!isNaN(tradeVolume)) {
              acc.totalVolume += tradeVolume
            }
            if (!isNaN(tradePnL)) {
              acc.pnl += tradePnL

              if (tradePnL > 0) {
                acc.winningTrades += 1
                acc.largestWin = Math.max(acc.largestWin, tradePnL)
              } else if (tradePnL < 0) {
                acc.losingTrades += 1
                acc.largestLoss = Math.min(acc.largestLoss, tradePnL)
              }
            }

            return acc
          },
          {
            totalTrades: 0,
            totalVolume: 0,
            pnl: 0,
            winningTrades: 0,
            losingTrades: 0,
            largestWin: 0,
            largestLoss: 0,
            tokenVolumes: new Map(),
          }
        )

        setStats(stats)
      } catch (error) {
        console.error(t('error.failed_to_fetch_trades'), error)
        setError(
          error instanceof Error
            ? error.message
            : t('error.failed_to_fetch_trades')
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrades()
  }, [walletAddress, timePeriod])

  const mostTradedToken = Array.from(stats.tokenVolumes.entries()).sort(
    ([, a], [, b]) => b.volume - a.volume
  )[0]

  return (
    <div className="border border-green-800 bg-black/50 w-full h-full overflow-hidden flex flex-col relative group">
      {!hideTitle && (
        <div className="border-b border-green-800 p-2 flex-shrink-0 bg-black/30">
          <div className="flex justify-between items-center">
            <div className="text-sm font-mono whitespace-nowrap">
              {'>'} {t('trade.trading_stats')}
            </div>
            <div className="flex items-center gap-2">
              <span className=" text-xs font-mono">
                {stats.totalTrades > 0
                  ? `TRADES: ${stats.totalTrades}`
                  : 'NO TRADES'}
              </span>
              <div className="flex items-center gap-1">
                {timePeriodTab.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => setTimePeriod(tf.value)}
                    className={`uppercase text-xs font-mono px-2 py-1 rounded transition-colors ${
                      timePeriod === tf.value
                        ? 'bg-green-800 '
                        : 'hover:bg-green-800/50'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="px-3 py-1.5 border border-red-800 bg-red-900/20 text-red-400 text-xs flex-shrink-0 mx-2 mt-2 rounded">
          <span className="uppercase">
            ! {t('common.error')}: {error}
          </span>
        </div>
      )}

      <div className="flex-grow overflow-y-auto p-4 font-mono scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-900/50">
        {isLoading ? (
          <div className="flex flex-col space-y-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <div className="text-xs uppercase">{t('common.pnl')}</div>
                <div className="h-5 w-20 bg-green-800/30 rounded"></div>
              </div>
              <div className="flex flex-col space-y-1 items-end">
                <div className="text-xs uppercase">{t('common.vol')}</div>
                <div className="h-5 w-24 bg-green-800/30 rounded"></div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-green-800/50 pt-3">
              <div className="flex flex-col space-y-1">
                <div className="text-xs uppercase">{t('common.w_l')}</div>
                <div className="h-5 w-14 bg-green-800/30 rounded"></div>
              </div>
              <div className="flex flex-col space-y-1 items-end">
                <div className="text-xs uppercase">
                  {t('common.best_and_worst')}
                </div>
                <div className="h-5 w-28 bg-green-800/30 rounded"></div>
              </div>
            </div>

            <div className="text-xs pt-1">
              {t('trade.most_traded')}:{' '}
              <span className="h-4 w-14 bg-green-800/30 rounded inline-block"></span>
            </div>
          </div>
        ) : stats.totalTrades === 0 ? (
          <div className="text-center py-2 text-sm">
            {t('trade.no_trades_found_for_selected_period')}
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-0.5">
                <div className="text-xs uppercase">{t('common.pnl')}</div>
                <div>
                  <span
                    className={`text-base ${
                      stats.pnl >= 0 ? '' : 'text-red-400'
                    }`}
                  >
                    ${formatNumber(stats.pnl)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col space-y-0.5 items-end">
                <div className="text-xs uppercase">{t('common.vol')}</div>
                <div>${formatNumber(stats.totalVolume)}</div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-green-800/50 pt-3">
              <div className="flex flex-col space-y-0.5">
                <div className="text-xs uppercase">{t('common.w_l')}</div>
                <div>
                  {stats.winningTrades}/{stats.losingTrades}
                </div>
              </div>
              <div className="flex flex-col space-y-0.5 items-end">
                <div className="text-xs uppercase">
                  {t('common.best_and_worst')}
                </div>
                <div className="flex items-center gap-1">
                  <span className="">${formatNumber(stats.largestWin)}</span>
                  <span className="">/</span>
                  <span className="text-red-400">
                    ${formatNumber(Math.abs(stats.largestLoss))}
                  </span>
                </div>
              </div>
            </div>

            {mostTradedToken && (
              <div className="text-xs pt-1">
                {t('trade.most_traded')}:{mostTradedToken[0]}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
