'use client'

import { useEffect, useState } from 'react'
import { formatNumber } from '@/utils/format'
import { TokenAddress } from './TokenAddress'
import { useRouter } from 'next/navigation'

interface TrendingToken {
  address: string
  symbol: string
  name: string
  price: number
  volume24hUSD: number
  liquidity: number
  logoURI?: string
  decimals: number
  rank: number
}

const mockData = {
  data: [
    {
      token: '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv',
      price: 0.040966864020118954,
      volume24h: 112553216.59624961,
      liquidity: 59313252.74928782,
      tokenData: {
        name: 'Pudgy Penguins',
        symbol: 'PENGU',
        decimals: 6,
        icon: 'https://wsrv.nl/?w=128&h=128&default=1&url=https%3A%2F%2Farweave.net%2FBW67hICaKGd2_wamSB0IQq-x7Xwtmr2oJj1WnWGJRHU',
      },
    },
    {
      token: 'FqveHfaf96iTjA3KgX1W5LWPnLFYv8EfUf6TQSWPpump',
      price: 0.008795643445172103,
      volume24h: 20406049.899464104,
      liquidity: 597739.6786430805,
      tokenData: {
        name: 'Exodus AI',
        symbol: 'EXO',
        decimals: 6,
        icon: 'https://wsrv.nl/?w=128&h=128&default=1&url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmQSsjf5sodffN5ioNQzYFsYcDd4t4NXwc7UWDpRKbhN3x',
      },
    },
    {
      token: 'CboMcTUYUcy9E6B3yGdFn6aEsGUnYV6yWeoeukw6pump',
      price: 0.0742232412138849,
      volume24h: 31943857.536628403,
      liquidity: 3386477.618855874,
      tokenData: {
        name: 'Butthole Coin',
        symbol: 'Butthole',
        decimals: 6,
        icon: 'https://wsrv.nl/?w=128&h=128&default=1&url=https%3A%2F%2Fipfs.io%2Fipfs%2FQme1teMr1bYqEFJaaJXyYpzDG73Npw6fkLuH7fgT8xgFoQ',
      },
    },
    {
      token: 'G1ykB1WkxEC2T4VvYufTQkYMNh7TdfAjTahEPabxpump',
      price: 0.0034419860962725257,
      volume24h: 21413312.384766683,
      liquidity: 371862.699303159,
      tokenData: {
        name: 'digital-twin-70b',
        symbol: 'DT70B',
        decimals: 6,
        icon: 'https://wsrv.nl/?w=128&h=128&default=1&url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmapAq9WtNrtyaDtjZPAHHNYmpSZAQU6HywwvfSWq4dQVV',
      },
    },
    {
      token: 'HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC',
      price: 1.7683292102935215,
      volume24h: 117780930.0761404,
      liquidity: 17768493.15852355,
      tokenData: {
        name: 'ai16z',
        symbol: 'ai16z',
        decimals: 9,
        icon: 'https://wsrv.nl/?w=128&h=128&default=1&url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmcNTVAoyJ7zDbPnN9jwiMoB8uCoJBUP9RGmmiGGHv44yX',
      },
    },
    {
      token: 'H4RLHiehZo8cwd7KntPFApsvunmBagaWjcdHZx8YFhdp',
      price: 4.620351572701019e-11,
      volume24h: 14509114.401437303,
      liquidity: 168704.0458410531,
      tokenData: {
        name: 'DeSci AI Agent',
        symbol: 'DeSciAI',
        decimals: 2,
        icon: 'https://wsrv.nl/?w=128&h=128&default=1&url=https%3A%2F%2Fgateway.irys.xyz%2F5nBSppDRswl8HcEak6FuUqKhRJ6ypErHkz-EvcofKdk',
      },
    },
    {
      token: 'CKTc5b9BcjyyVSqNkakzGy7ckMzoysnpzgQxkbwzpump',
      price: 0.002088051192243,
      volume24h: 31133817.007265743,
      liquidity: 338444.22218062263,
      tokenData: {
        name: 'Bolt',
        symbol: 'BOLT',
        decimals: 6,
        icon: 'https://wsrv.nl/?w=128&h=128&default=1&url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmZsM6ounSSUtLQv2o7Dbw4u7aqg5xGegGwcVYrskBzi76',
      },
    },
    {
      token: '45ZAM7JK8ZGHuBQiJ8kvhdiVdiQGsTQGgt3gRAEQpump',
      price: 0.00697462615312594,
      volume24h: 59591764.8420808,
      liquidity: 907891.0763013025,
      tokenData: {
        name: 'Asha',
        symbol: 'Asha',
        decimals: 6,
        icon: 'https://wsrv.nl/?w=128&h=128&default=1&url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmQMTRQM2Uwy5rQbnFctcQ9YcJmBSqU296SSdkXPVV7Z2c',
      },
    },
    {
      token: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      price: 0.000033883811851103895,
      volume24h: 13263428.911024546,
      liquidity: 21943288.9950599,
      tokenData: {
        name: 'Bonk',
        symbol: 'Bonk',
        decimals: 5,
        icon: 'https://wsrv.nl/?w=128&h=128&default=1&url=https%3A%2F%2Farweave.net%2FhQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
      },
    },
    {
      token: '4oXKDW54xCwFSWagfVJS8dwoqgSo3SVH1y6orzQgpump',
      price: 0.0005772785254627544,
      volume24h: 7160549.651513151,
      liquidity: 106404.26888197364,
      tokenData: {
        name: 'Chill Pepe',
        symbol: 'CHILLPEPE',
        decimals: 6,
        icon: 'https://wsrv.nl/?w=128&h=128&default=1&url=https%3A%2F%2Fipfs.io%2Fipfs%2FQmWzoAhn1Gp9UuU6yNcc47huBs5x3farsdwEuGdCyv2iHw',
      },
    },
  ],
  success: true,
}

export const TrendingTokens = () => {
  const [tokens, setTokens] = useState<TrendingToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedToken, setSelectedToken] = useState<TrendingToken | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Transform mock data to match our interface
    const transformedTokens = mockData.data.map((item, index) => ({
      address: item.token,
      symbol: item.tokenData.symbol,
      name: item.tokenData.name,
      price: item.price,
      volume24hUSD: item.volume24h,
      liquidity: item.liquidity,
      logoURI: item.tokenData.icon,
      decimals: item.tokenData.decimals,
      rank: index + 1,
    }))

    setTokens(transformedTokens)
    setIsLoading(false)
  }, [])

  if (!isLoading && tokens.length === 0) return null

  const getPercentageChange = (value: number) => {
    // Mock percentage change for demonstration
    return (Math.random() * 20 - 10).toFixed(2)
  }

  return (
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden flex flex-col h-[600px] relative group">
      {/* Header */}
      <div className="border-b border-green-800 p-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="text-green-500 text-sm font-mono">
            {'>'} trending_tokens.sol
          </div>
          <div className="text-xs text-green-600 font-mono">
            RANK BY: VOLUME 24H
          </div>
        </div>
      </div>

      {error && <div className="p-2 text-red-400 text-sm">Error: {error}</div>}

      {/* Content */}
      <div className="overflow-y-auto flex-grow scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-900/50">
        {isLoading ? (
          <div className="p-4 text-center text-green-600 font-mono animate-pulse">
            {'>>> FETCHING TRENDING TOKENS...'}
          </div>
        ) : (
          <div className="divide-y divide-green-800/30">
            {tokens.map((token) => (
              <div
                key={token.address}
                className="p-4 hover:bg-green-900/10 transition-colors cursor-pointer"
                onClick={() =>
                  setSelectedToken(token === selectedToken ? null : token)
                }
              >
                <div className="flex items-start gap-4">
                  {/* Token Icon and Basic Info */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-sm"></div>
                      {token.logoURI ? (
                        <img
                          src={token.logoURI}
                          alt={token.symbol}
                          className="w-12 h-12 rounded-lg object-cover bg-black/40 ring-1 ring-green-500/20 relative z-[1]"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).style.display =
                              'none'
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-black/40 ring-1 ring-green-500/20 flex items-center justify-center relative z-[1]">
                          <span className="text-green-500 font-mono text-lg">
                            {token.symbol.slice(0, 2)}
                          </span>
                        </div>
                      )}
                      <div className="absolute -top-2 -left-2 w-7 h-7 bg-green-900 rounded-full flex items-center justify-center ring-2 ring-green-500 shadow-lg z-[2]">
                        <span className="text-green-400 text-xs font-mono font-bold">
                          #{token.rank}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Token Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/${token.address}`)
                          }}
                          className="text-green-400 font-mono font-bold hover:text-green-300 transition-colors"
                        >
                          {token.symbol}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/${token.address}`)
                          }}
                          className="text-green-600 text-sm truncate hover:text-green-500 transition-colors"
                        >
                          {token.name}
                        </button>
                      </div>
                      <TokenAddress address={token.address} />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="text-green-600 text-xs">Price</div>
                        <div className="text-green-400 font-mono">
                          ${formatNumber(token.price)}
                        </div>
                        <div className="text-xs font-mono">
                          <span
                            className={
                              getPercentageChange(token.price).startsWith('-')
                                ? 'text-red-400'
                                : 'text-green-400'
                            }
                          >
                            {getPercentageChange(token.price)}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-green-600 text-xs">Volume 24h</div>
                        <div className="text-green-400 font-mono">
                          ${formatNumber(token.volume24hUSD)}
                        </div>
                        <div className="text-xs font-mono">
                          <span
                            className={
                              getPercentageChange(
                                token.volume24hUSD,
                              ).startsWith('-')
                                ? 'text-red-400'
                                : 'text-green-400'
                            }
                          >
                            {getPercentageChange(token.volume24hUSD)}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-green-600 text-xs">Liquidity</div>
                        <div className="text-green-400 font-mono">
                          ${formatNumber(token.liquidity)}
                        </div>
                        <div className="text-xs font-mono">
                          <span
                            className={
                              getPercentageChange(token.liquidity).startsWith(
                                '-',
                              )
                                ? 'text-red-400'
                                : 'text-green-400'
                            }
                          >
                            {getPercentageChange(token.liquidity)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded View */}
                    {selectedToken === token && (
                      <div className="mt-4 p-3 bg-green-900/10 rounded-lg border border-green-800/30">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-green-600 text-xs mb-1">
                              Token Address
                            </div>
                            <TokenAddress address={token.address} showFull />
                          </div>
                          <div>
                            <div className="text-green-600 text-xs mb-1">
                              Decimals
                            </div>
                            <div className="text-green-400 font-mono text-sm">
                              {token.decimals}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scroll Progress Indicator */}
      <div className="absolute right-2 top-[48px] bottom-2 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="h-full bg-green-500/5 rounded-full">
          <div className="h-24 w-full bg-green-500/10 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
