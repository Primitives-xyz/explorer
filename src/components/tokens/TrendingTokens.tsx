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
  const [sortBy, setSortBy] = useState<'volume24hUSD' | 'rank' | 'liquidity'>(
    'volume24hUSD',
  )
  const router = useRouter()

  useEffect(() => {
    const fetchTrendingTokens = async () => {
      try {
        setIsLoading(true)
        const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            'x-chain': 'solana',
            'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '',
          },
        }

        const response = await fetch(
          `https://public-api.birdeye.so/defi/token_trending?sort_by=${sortBy}&sort_type=${
            sortBy === 'rank' ? 'asc' : 'desc'
          }&offset=0&limit=20`,
          options,
        )

        if (!response.ok) {
          throw new Error('Failed to fetch trending tokens')
        }

        const data = await response.json()
        if (!data.success) {
          throw new Error('API request failed')
        }

        // Sort tokens based on the selected metric
        const sortedTokens = data.data.tokens
          .sort(
            (a: TrendingToken, b: TrendingToken) =>
              sortBy === 'rank'
                ? a[sortBy] - b[sortBy] // ascending for rank
                : b[sortBy] - a[sortBy], // descending for others
          )
          .map((token: TrendingToken, index: number) => ({
            ...token,
            rank: index + 1,
          }))

        setTokens(sortedTokens)
      } catch (err) {
        console.error('Error fetching trending tokens:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch tokens')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendingTokens()
  }, [sortBy])

  const getSortLabel = () => {
    switch (sortBy) {
      case 'volume24hUSD':
        return 'VOLUME 24H'
      case 'rank':
        return 'RANK'
      case 'liquidity':
        return 'LIQUIDITY'
      default:
        return 'VOLUME 24H'
    }
  }

  return (
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden flex flex-col h-[400px] lg:h-[600px] relative group backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-green-800 p-4 flex-shrink-0 bg-black/20">
        <div className="flex justify-between items-center">
          <div className="text-green-500 text-sm font-mono flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {'>'} trending_tokens.sol
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-green-600 font-mono bg-green-900/20 px-3 py-1 rounded-full">
              RANK BY: {getSortLabel()}
            </div>
            <div className="text-xs text-green-600 font-mono bg-green-900/20 px-3 py-1 rounded-full">
              COUNT: {tokens.length}
            </div>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="border-b border-green-800/30 p-2 flex-shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSortBy('volume24hUSD')}
            className={`px-2 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors ${
              sortBy === 'volume24hUSD'
                ? 'bg-green-500 text-black font-semibold'
                : 'text-green-500 hover:bg-green-500/10'
            }`}
          >
            Volume 24h
          </button>
          <button
            onClick={() => setSortBy('rank')}
            className={`px-2 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors ${
              sortBy === 'rank'
                ? 'bg-green-500 text-black font-semibold'
                : 'text-green-500 hover:bg-green-500/10'
            }`}
          >
            Rank
          </button>
          <button
            onClick={() => setSortBy('liquidity')}
            className={`px-2 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors ${
              sortBy === 'liquidity'
                ? 'bg-green-500 text-black font-semibold'
                : 'text-green-500 hover:bg-green-500/10'
            }`}
          >
            Liquidity
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2 mb-4 border border-red-800 bg-red-900/20 text-red-400 flex-shrink-0">
          <span>! ERROR: {error}</span>
        </div>
      )}

      {/* Content */}
      <div className="divide-y divide-green-800/30 overflow-y-auto flex-grow scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-900/50">
        {isLoading ? (
          <div className="p-8 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-green-600 font-mono animate-pulse">
              {'>>> FETCHING TRENDING TOKENS...'}
            </div>
          </div>
        ) : tokens.length === 0 ? (
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> NO TOKENS FOUND'}
          </div>
        ) : (
          <div className="divide-y divide-green-800/30">
            {tokens.map((token) => (
              <div
                key={token.address}
                className="p-3 hover:bg-green-900/10 transition-all duration-200 cursor-pointer group/item min-h-[85px]"
                onClick={() =>
                  setSelectedToken(token === selectedToken ? null : token)
                }
              >
                <div className="flex items-start gap-3 h-full">
                  {/* Token Icon */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-md group-hover/item:blur-lg transition-all" />
                    {token.logoURI ? (
                      <img
                        src={token.logoURI}
                        alt={token.symbol}
                        className="w-12 h-12 rounded-lg object-cover bg-black/40 ring-1 ring-green-500/20 relative z-[1] group-hover/item:ring-green-500/40 transition-all"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-black/40 ring-1 ring-green-500/20 flex items-center justify-center relative z-[1]">
                        <span className="text-green-500 font-mono text-lg">
                          {token.symbol.slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <div className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-green-900/90 rounded-full flex items-center justify-center ring-2 ring-green-500 shadow-lg z-[2] group-hover/item:scale-110 transition-transform">
                      <span className="text-green-400 text-xs font-mono font-bold">
                        #{token.rank}
                      </span>
                    </div>
                  </div>

                  {/* Token Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/${token.address}`)
                            }}
                            className="text-green-400 font-mono text-sm bg-green-900/20 px-2 py-0.5 rounded-lg hover:bg-green-900/40 transition-colors font-bold truncate max-w-[200px]"
                          >
                            {token.name}
                          </button>
                          <span className="text-green-600 text-xs flex-shrink-0">
                            ${token.symbol}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-black/30 px-2 py-0.5 rounded-md flex-shrink-0">
                          <span className="text-green-600/60 text-xs">
                            price:
                          </span>
                          <span className="text-green-400 font-mono text-xs font-medium">
                            ${formatNumber(token.price)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 bg-black/30 px-2 py-0.5 rounded-md min-w-0">
                          <span className="text-green-600/60 text-xs flex-shrink-0">
                            address:
                          </span>
                          <TokenAddress address={token.address} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-green-600 font-mono flex-shrink-0">
                          <span>Vol: ${formatNumber(token.volume24hUSD)}</span>
                          <span>Liq: ${formatNumber(token.liquidity)}</span>
                        </div>
                      </div>

                      {/* Expanded View */}
                      {selectedToken === token && (
                        <div className="mt-2 p-2 bg-green-900/10 rounded-lg border border-green-800/30 backdrop-blur-sm">
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
                              <div className="text-green-400 font-mono text-sm bg-green-900/20 px-2 py-0.5 rounded-md inline-block">
                                {token.decimals}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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
