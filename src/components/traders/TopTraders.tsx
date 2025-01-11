'use client'

import { useEffect, useState } from 'react'
import { formatNumber } from '@/utils/format'
import { TokenAddress } from '../tokens/TokenAddress'
import { useRouter } from 'next/navigation'

type TimeFrame = 'today' | 'yesterday' | '1W'

interface Trader {
  network: string
  address: string
  pnl: number
  trade_count: number
  volume: number
}

export const TopTraders = () => {
  const [traders, setTraders] = useState<Trader[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('today')
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchTopTraders = async () => {
      try {
        const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            'x-chain': 'solana',
            'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '',
          },
        }

        console.log('Fetching with options:', {
          ...options,
          headers: {
            ...options.headers,
            'X-API-KEY': '***', // Hide API key in logs
          },
        })

        const response = await fetch(
          `https://public-api.birdeye.so/trader/gainers-losers?type=${timeFrame}&sort_by=PnL&sort_type=desc&offset=0&limit=10`,
          options,
        )

        if (!response.ok) {
          const errorText = await response.text()
          console.error('API Response:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          })
          throw new Error(
            `Failed to fetch top traders: ${response.status} ${response.statusText}`,
          )
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(
            `API request failed: ${data.message || 'Unknown error'}`,
          )
        }

        setTraders(data.data.items)
      } catch (err) {
        console.error('Error fetching top traders:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch traders')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopTraders()
  }, [timeFrame])

  const renderStatCard = (
    label: string,
    value: string | number,
    additionalInfo?: string,
    color?: string,
  ) => (
    <div className="bg-black/30 p-3 rounded-lg border border-indigo-800/30 hover:border-indigo-500/50 transition-all">
      <div className="text-indigo-400 text-xs mb-1">{label}</div>
      <div className={`font-mono text-lg font-medium ${color || 'text-white'}`}>
        {value}
      </div>
      {additionalInfo && (
        <div className="text-indigo-400/60 text-xs mt-1">{additionalInfo}</div>
      )}
    </div>
  )

  return (
    <div className="border border-indigo-800 bg-black/50 w-full overflow-hidden flex flex-col h-[600px] relative group backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-indigo-800 p-4 flex-shrink-0 bg-black/20">
        <div className="flex justify-between items-center">
          <div className="text-indigo-500 text-sm font-mono flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            {'>'} top_traders.sol
          </div>
          <div className="flex gap-2">
            {(['today', 'yesterday', '1W'] as TimeFrame[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFrame(tf)}
                className={`text-xs font-mono px-3 py-1 rounded-full transition-all ${
                  timeFrame === tf
                    ? 'bg-indigo-500 text-black'
                    : 'text-indigo-400 bg-indigo-900/20 hover:bg-indigo-900/40'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 m-4 text-red-400 text-sm border border-red-900/50 rounded-lg bg-red-900/10">
          <div className="flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            Error: {error}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="overflow-y-auto flex-grow scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-indigo-900/50">
        {isLoading ? (
          <div className="p-8 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-indigo-600 font-mono animate-pulse">
              {'>>> ANALYZING TRADER PERFORMANCE...'}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-indigo-800/30">
            {traders.map((trader, index) => {
              const avgTradeSize =
                trader.trade_count > 0 ? trader.volume / trader.trade_count : 0
              const isSelected = selectedTrader === trader

              return (
                <div
                  key={trader.address}
                  className={`p-4 transition-all duration-200 cursor-pointer ${
                    isSelected ? 'bg-indigo-900/20' : 'hover:bg-indigo-900/10'
                  }`}
                  onClick={() => setSelectedTrader(isSelected ? null : trader)}
                >
                  <div className="flex items-start gap-4">
                    {/* Rank Badge */}
                    <div className="relative">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center ${
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
                          className={`font-mono text-xl font-bold ${
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
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-black text-xs">⚡</span>
                      </div>
                    </div>

                    {/* Trader Details */}
                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="flex items-center justify-between">
                        <TokenAddress address={trader.address} />
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            trader.pnl >= 0
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {trader.pnl >= 0 ? '▲' : '▼'} $
                          {formatNumber(Math.abs(trader.pnl))}
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-3">
                        {renderStatCard(
                          'PNL/Trade',
                          `$${formatNumber(
                            Math.abs(trader.pnl / trader.trade_count),
                          )}`,
                          'Average Profit per Trade',
                          trader.pnl >= 0 ? 'text-green-400' : 'text-red-400',
                        )}
                        {renderStatCard(
                          'Volume',
                          `$${formatNumber(trader.volume)}`,
                          'Total Trading Volume',
                        )}
                        {renderStatCard(
                          'Trades',
                          formatNumber(trader.trade_count),
                          `Avg. Size $${formatNumber(avgTradeSize)}`,
                        )}
                      </div>

                      {/* Expanded View */}
                      {isSelected && (
                        <div className="mt-4 p-4 bg-black/30 rounded-lg border border-indigo-800/30">
                          <div className="space-y-4">
                            <div className="text-indigo-400 font-mono text-sm">
                              <div className="mb-2 text-indigo-500 font-semibold">
                                Trading Stats
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-indigo-400/60">
                                    Total PNL
                                  </div>
                                  <div
                                    className={`text-lg ${
                                      trader.pnl >= 0
                                        ? 'text-green-400'
                                        : 'text-red-400'
                                    }`}
                                  >
                                    ${formatNumber(Math.abs(trader.pnl))}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-indigo-400/60">
                                    Network
                                  </div>
                                  <div className="text-indigo-400 uppercase">
                                    {trader.network}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="text-indigo-500 font-semibold mb-2">
                                Full Address
                              </div>
                              <TokenAddress address={trader.address} showFull />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Scroll Progress Indicator */}
      <div className="absolute right-2 top-[48px] bottom-2 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="h-full bg-indigo-500/5 rounded-full">
          <div className="h-24 w-full bg-indigo-500/20 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
