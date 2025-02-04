'use client'

import { useEffect, useState, useCallback, memo, useRef } from 'react'
import { formatNumber } from '@/utils/format'
import { TokenAddress } from './TokenAddress'
import { useRouter } from 'next/navigation'
import { DataContainer } from '../common/DataContainer'
import { ScrollableContent } from '../common/ScrollableContent'
import { FilterBar } from '../common/FilterBar'
import { FilterButton } from '../common/FilterButton'
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual'
import { JupiterSwapModal } from './JupiterSwapModal'

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

// Memoized token card component to prevent unnecessary re-renders
const TokenCard = memo(
  ({
    token,
    isSelected,
    onClick,
  }: {
    token: TrendingToken
    isSelected: boolean
    onClick: () => void
  }) => {
    const router = useRouter()
    const [showSwapModal, setShowSwapModal] = useState(false)

    return (
      <>
        <div
          className="p-3 hover:bg-green-900/10 transition-all duration-200 cursor-pointer group/item min-h-[85px]"
          onClick={onClick}
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
                  loading="lazy"
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
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 text-xs flex-shrink-0">
                        ${token.symbol}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowSwapModal(true)
                        }}
                        className="text-green-400 text-xs bg-green-900/30 px-2 py-0.5 rounded hover:bg-green-900/50 transition-colors border border-green-500/20 hover:border-green-500/40"
                      >
                        Trade
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/30 px-2 py-0.5 rounded-md flex-shrink-0">
                    <span className="text-green-600/60 text-xs">price:</span>
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
              </div>
            </div>
          </div>
        </div>

        <JupiterSwapModal
          isOpen={showSwapModal}
          onClose={() => setShowSwapModal(false)}
          tokenAddress={token.address}
          tokenSymbol={token.symbol}
          tokenDecimals={token.decimals}
        />
      </>
    )
  },
)

TokenCard.displayName = 'TokenCard'

export const TrendingTokens = () => {
  const [tokens, setTokens] = useState<TrendingToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedToken, setSelectedToken] = useState<TrendingToken | null>(null)
  const [sortBy, setSortBy] = useState<'volume24hUSD' | 'rank' | 'liquidity'>(
    'volume24hUSD',
  )

  // Create a container ref for the virtualizer
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Set up virtualization
  const rowVirtualizer = useVirtualizer({
    count: tokens.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 85, // Estimated height of each row
    overscan: 5, // Number of items to render outside the visible area
  })

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

        const sortedTokens = data.data.tokens
          .sort((a: TrendingToken, b: TrendingToken) =>
            sortBy === 'rank' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy],
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

  return (
    <DataContainer title="trending_tokens" count={tokens.length} error={error}>
      <FilterBar>
        <FilterButton
          label="Volume 24h"
          isSelected={sortBy === 'volume24hUSD'}
          onClick={() => setSortBy('volume24hUSD')}
        />
        <FilterButton
          label="Rank"
          isSelected={sortBy === 'rank'}
          onClick={() => setSortBy('rank')}
        />
        <FilterButton
          label="Liquidity"
          isSelected={sortBy === 'liquidity'}
          onClick={() => setSortBy('liquidity')}
        />
      </FilterBar>

      <ScrollableContent
        isLoading={isLoading}
        isEmpty={tokens.length === 0}
        loadingText=">>> FETCHING TRENDING TOKENS..."
        emptyText=">>> NO TOKENS FOUND"
      >
        <div
          ref={scrollContainerRef}
          className="divide-y divide-green-800/30 h-full overflow-auto"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
              const token = tokens[virtualRow.index]
              return (
                <div
                  key={token.address}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <TokenCard
                    token={token}
                    isSelected={selectedToken?.address === token.address}
                    onClick={() =>
                      setSelectedToken(
                        selectedToken?.address === token.address ? null : token,
                      )
                    }
                  />
                </div>
              )
            })}
          </div>
        </div>
      </ScrollableContent>
    </DataContainer>
  )
}
