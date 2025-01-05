'use client'

import { useEffect, useState } from 'react'
import { formatNumber } from '@/utils/format'

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
          console.error('Failed to fetch trending tokens', response)
          throw new Error('Failed to fetch trending tokens')
        }

        const data = await response.json()
        if (!data.success) {
          throw new Error('API request failed')
        }

        setTokens(data.data?.tokens || [])
      } catch (err) {
        console.error('Error fetching trending tokens:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch tokens')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendingTokens()
  }, [])

  if (!isLoading && tokens.length === 0) return null

  return (
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden flex flex-col h-[284px] relative group">
      {/* Header */}
      <div className="border-b border-green-800 p-2 flex-shrink-0">
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
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> FETCHING TRENDING TOKENS...'}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2">
            {tokens.map((token) => (
              <div
                key={token.address}
                className="p-2 border border-green-800/30 rounded bg-black/30 hover:bg-green-900/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {token.logoURI && (
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        // Hide broken images
                        ;(e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="text-green-400 text-sm font-mono">
                      {token.symbol}
                    </span>
                    <span className="text-green-600 text-xs">
                      ${formatNumber(token.price)}
                    </span>
                  </div>
                </div>
                <div className="mt-1 flex justify-between items-center">
                  <span className="text-xs font-mono text-green-600">
                    #{token.rank}
                  </span>
                  <span className="text-xs font-mono text-green-400">
                    ${formatNumber(token.volume24hUSD)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
