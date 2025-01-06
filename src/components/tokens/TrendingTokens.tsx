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

export const TrendingTokens = () => {
  const [tokens, setTokens] = useState<TrendingToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedToken, setSelectedToken] = useState<TrendingToken | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchTrendingTokens = async () => {
      try {
        const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            'x-chain': 'solana',
            'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '',
          },
        }

        const response = await fetch(
          'https://public-api.birdeye.so/defi/token_trending?sort_by=rank&sort_type=asc&offset=0&limit=20',
          options,
        )

        if (!response.ok) {
          throw new Error('Failed to fetch trending tokens')
        }

        const data = await response.json()
        if (!data.success) {
          throw new Error('API request failed')
        }

        setTokens(data.data.tokens)
      } catch (err) {
        console.error('Error fetching trending tokens:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch tokens')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendingTokens()
  }, [])

  return (
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden flex flex-col h-[600px] relative group backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-green-800 p-4 flex-shrink-0 bg-black/20">
        <div className="flex justify-between items-center">
          <div className="text-green-500 text-sm font-mono flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {'>'} trending_tokens.sol
          </div>
          <div className="text-xs text-green-600 font-mono bg-green-900/20 px-3 py-1 rounded-full">
            RANK BY: VOLUME 24H
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
      <div className="overflow-y-auto flex-grow scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-900/50">
        {isLoading ? (
          <div className="p-8 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-green-600 font-mono animate-pulse">
              {'>>> FETCHING TRENDING TOKENS...'}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-green-800/30">
            {tokens.map((token) => (
              <div
                key={token.address}
                className="p-4 hover:bg-green-900/10 transition-all duration-200 cursor-pointer group/item"
                onClick={() =>
                  setSelectedToken(token === selectedToken ? null : token)
                }
              >
                <div className="flex items-start gap-4">
                  {/* Token Icon */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-md group-hover/item:blur-lg transition-all" />
                      {token.logoURI ? (
                        <img
                          src={token.logoURI}
                          alt={token.symbol}
                          className="w-12 h-12 rounded-lg object-cover bg-black/40 ring-1 ring-green-500/20 relative z-[1] group-hover/item:ring-green-500/40 transition-all"
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
                      <div className="absolute -top-2 -left-2 w-7 h-7 bg-green-900/90 rounded-full flex items-center justify-center ring-2 ring-green-500 shadow-lg z-[2] group-hover/item:scale-110 transition-transform">
                        <span className="text-green-400 text-xs font-mono font-bold">
                          #{token.rank}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Token Details */}
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex items-center gap-4">
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
                        <span className="text-green-600/50">•</span>
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
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        {
                          label: 'Price',
                          value: `$${formatNumber(token.price)}`,
                        },
                        {
                          label: 'Volume 24h',
                          value: `$${formatNumber(token.volume24hUSD)}`,
                        },
                        {
                          label: 'Liquidity',
                          value: `$${formatNumber(token.liquidity)}`,
                        },
                      ].map((stat, i) => (
                        <div key={i} className="space-y-2">
                          <div className="text-green-600 text-xs">
                            {stat.label}
                          </div>
                          <div className="text-green-400 font-mono font-medium">
                            {stat.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Expanded View */}
                    {selectedToken === token && (
                      <div className="mt-4 p-4 bg-green-900/10 rounded-lg border border-green-800/30 backdrop-blur-sm">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <div className="text-green-600 text-xs mb-2">
                              Token Address
                            </div>
                            <TokenAddress address={token.address} showFull />
                          </div>
                          <div>
                            <div className="text-green-600 text-xs mb-2">
                              Decimals
                            </div>
                            <div className="text-green-400 font-mono text-sm bg-green-900/20 px-3 py-1 rounded-md inline-block">
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
          <div className="h-24 w-full bg-green-500/20 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
