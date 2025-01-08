'use client'
import { useEffect, useState } from 'react'
import { formatNumber } from '@/utils/format'

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

type TimePeriod = '1d' | 'yesterday' | '7d'

export const TradingStats = ({
  walletAddress,
  hideTitle = false,
}: TradingStatsProps) => {
  const [trades, setTrades] = useState<Trade[]>([])
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('7d')
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
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)

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

        console.log('Time period:', timePeriod)
        console.log('Current time:', new Date(now * 1000).toISOString())
        console.log('After time:', new Date(afterTime * 1000).toISOString())

        const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            'x-chain': 'solana',
            'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '',
          },
        }

        const apiUrl = `https://public-api.birdeye.so/trader/txs/seek_by_time?address=${walletAddress}&offset=0&limit=100&tx_type=swap&after_time=${afterTime}`
        console.log('API URL:', apiUrl)

        const response = await fetch(apiUrl, options)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: TradeResponse = await response.json()
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch trades')
        }

        console.log('Number of trades received:', data.data.items.length)
        if (data.data.items.length > 0) {
          console.log(
            'First trade time:',
            new Date(data.data.items[0].block_unix_time * 1000).toISOString(),
          )
          console.log(
            'Last trade time:',
            new Date(
              data.data.items[data.data.items.length - 1].block_unix_time *
                1000,
            ).toISOString(),
          )
        }

        let filteredTrades = data.data.items
        if (timePeriod === 'yesterday' && yesterdayStart !== null) {
          const yesterdayEnd = yesterdayStart + oneDaySeconds
          filteredTrades = data.data.items.filter(
            (trade) =>
              trade.block_unix_time >= yesterdayStart &&
              trade.block_unix_time < yesterdayEnd,
          )
          console.log('Filtered trades for yesterday:', filteredTrades.length)
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
              const current = acc.tokenVolumes.get(token) || {
                volume: 0,
                trades: 0,
              }
              const isQuote = token === trade.quote.symbol
              acc.tokenVolumes.set(token, {
                volume:
                  current.volume + (isQuote ? quoteUsdValue : baseUsdValue),
                trades: current.trades + 1,
              })
            }

            acc.totalTrades += 1
            acc.totalVolume += Math.max(baseUsdValue, quoteUsdValue)
            acc.pnl += tradePnL

            if (tradePnL > 0) {
              acc.winningTrades += 1
              acc.largestWin = Math.max(acc.largestWin, tradePnL)
            } else if (tradePnL < 0) {
              acc.losingTrades += 1
              acc.largestLoss = Math.min(acc.largestLoss, tradePnL)
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
          },
        )

        setStats(stats)
      } catch (error) {
        console.error('Error fetching trades:', error)
        setError(
          error instanceof Error ? error.message : 'Failed to fetch trades',
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrades()
  }, [walletAddress, timePeriod])

  const mostTradedToken = Array.from(stats.tokenVolumes.entries()).sort(
    ([, a], [, b]) => b.volume - a.volume,
  )[0]

  return (
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden flex flex-col h-[200px] relative group">
      {!hideTitle && (
        <div className="border-b border-green-800 p-3 flex-shrink-0 bg-black/30">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-green-500 text-sm font-mono whitespace-nowrap">
                {'>'} trading_stats.sol
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-green-600">
                  {stats.totalTrades > 0
                    ? `TRADES: ${stats.totalTrades}`
                    : 'NO TRADES'}
                </span>
                {process.env.NODE_ENV === 'development' && (
                  <span className="text-green-800 bg-green-900/30 px-2 py-0.5 rounded">
                    {timePeriod.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                onClick={() => setTimePeriod('1d')}
                className={`text-xs font-mono px-3 py-1.5 rounded transition-colors ${
                  timePeriod === '1d'
                    ? 'bg-green-800 text-green-200'
                    : 'text-green-600 hover:bg-green-800/50'
                }`}
              >
                1D
              </button>
              <button
                onClick={() => setTimePeriod('yesterday')}
                className={`text-xs font-mono px-3 py-1.5 rounded transition-colors ${
                  timePeriod === 'yesterday'
                    ? 'bg-green-800 text-green-200'
                    : 'text-green-600 hover:bg-green-800/50'
                }`}
              >
                Yesterday
              </button>
              <button
                onClick={() => setTimePeriod('7d')}
                className={`text-xs font-mono px-3 py-1.5 rounded transition-colors ${
                  timePeriod === '7d'
                    ? 'bg-green-800 text-green-200'
                    : 'text-green-600 hover:bg-green-800/50'
                }`}
              >
                7D
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="px-4 py-2 border border-red-800 bg-red-900/20 text-red-400 flex-shrink-0 m-3 rounded">
          <span>! ERROR: {error}</span>
        </div>
      )}

      <div className="flex-grow p-6 font-mono">
        {isLoading ? (
          <div className="flex flex-col space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <div className="text-green-600/50 text-xs">PERIOD PNL</div>
                <div className="h-6 w-24 bg-green-800/30 rounded"></div>
              </div>
              <div className="flex flex-col space-y-1 items-end">
                <div className="text-green-600/50 text-xs">VOLUME</div>
                <div className="h-6 w-28 bg-green-800/30 rounded"></div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-green-800/50 pt-4">
              <div className="flex flex-col space-y-1">
                <div className="text-green-600/50 text-xs">WIN/LOSS</div>
                <div className="h-6 w-16 bg-green-800/30 rounded"></div>
              </div>
              <div className="flex flex-col space-y-1 items-end">
                <div className="text-green-600/50 text-xs">
                  BEST TRADE / WORST TRADE
                </div>
                <div className="h-6 w-32 bg-green-800/30 rounded"></div>
              </div>
            </div>

            <div className="text-xs text-green-600/50">
              Most traded:{' '}
              <span className="h-4 w-16 bg-green-800/30 rounded inline-block"></span>
            </div>
          </div>
        ) : stats.totalTrades === 0 ? (
          <div className="text-center text-green-600 py-4">
            {'>>> NO TRADES FOUND FOR SELECTED PERIOD'}
          </div>
        ) : (
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <div className="text-green-600 text-xs">PERIOD PNL</div>
                <div className="text-lg">
                  <span
                    className={
                      stats.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    }
                  >
                    ${formatNumber(stats.pnl)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col space-y-1 items-end">
                <div className="text-green-600 text-xs">VOLUME</div>
                <div className="text-green-400">
                  ${formatNumber(stats.totalVolume)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-green-800/50 pt-4">
              <div className="flex flex-col space-y-1">
                <div className="text-green-600 text-xs">WIN/LOSS</div>
                <div className="text-green-400">
                  {stats.winningTrades}/{stats.losingTrades}
                </div>
              </div>
              <div className="flex flex-col space-y-1 items-end">
                <div className="text-green-600 text-xs">
                  BEST TRADE / WORST TRADE
                </div>
                <div>
                  <span className="text-green-400">
                    ${formatNumber(stats.largestWin)}
                  </span>
                  <span className="text-green-600 mx-1">/</span>
                  <span className="text-red-400">
                    ${formatNumber(Math.abs(stats.largestLoss))}
                  </span>
                </div>
              </div>
            </div>

            {mostTradedToken && (
              <div className="text-xs text-green-600">
                Most traded: {mostTradedToken[0]}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
