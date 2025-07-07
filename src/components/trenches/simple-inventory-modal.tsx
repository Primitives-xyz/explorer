'use client'

import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useIsMobile } from '@/utils/use-is-mobile'
import {
  ChevronDown,
  ChevronRight,
  DollarSign,
  Package,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

// Simple token info cache
const TOKEN_INFO_CACHE = new Map<
  string,
  { info: TokenInfo; timestamp: number }
>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

interface TokenInfo {
  symbol: string
  name: string
  image?: string
}

// Hook to fetch token info with caching
function useTokenInfo(mints: string[]) {
  const [tokenInfo, setTokenInfo] = useState<Record<string, TokenInfo>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchTokenInfo = async (mintsToFetch: string[]) => {
      if (mintsToFetch.length === 0) return

      setLoading(true)

      const fetchPromises = mintsToFetch.map(async (mint) => {
        try {
          const response = await fetch(`/api/token?mint=${mint}`)
          if (response.ok) {
            const data = await response.json()
            const info: TokenInfo = {
              symbol:
                data?.result?.content?.metadata?.symbol || mint.substring(0, 8),
              name:
                data?.result?.content?.metadata?.name || mint.substring(0, 8),
              image: data?.result?.content?.links?.image,
            }

            // Cache the result
            TOKEN_INFO_CACHE.set(mint, {
              info,
              timestamp: Date.now(),
            })
            return { mint, info }
          }
        } catch (error) {
          console.warn(`Failed to fetch token info for ${mint}:`, error)
        }

        // Fallback
        const fallbackInfo: TokenInfo = {
          symbol: mint.substring(0, 8),
          name: mint.substring(0, 8),
        }

        TOKEN_INFO_CACHE.set(mint, {
          info: fallbackInfo,
          timestamp: Date.now(),
        })

        return { mint, info: fallbackInfo }
      })

      const results = await Promise.all(fetchPromises)
      const newTokenInfo: Record<string, TokenInfo> = {}

      results.forEach(({ mint, info }) => {
        newTokenInfo[mint] = info
      })

      setTokenInfo((prev) => ({ ...prev, ...newTokenInfo }))
      setLoading(false)
    }

    const now = Date.now()
    const mintsToFetch: string[] = []
    const cachedInfo: Record<string, TokenInfo> = {}

    // Check cache first
    mints.forEach((mint) => {
      const cached = TOKEN_INFO_CACHE.get(mint)
      if (cached && now - cached.timestamp < CACHE_DURATION) {
        cachedInfo[mint] = cached.info
      } else {
        mintsToFetch.push(mint)
      }
    })

    // Set cached info immediately
    if (Object.keys(cachedInfo).length > 0) {
      setTokenInfo((prev) => ({ ...prev, ...cachedInfo }))
    }

    // Fetch missing info
    if (mintsToFetch.length > 0) {
      fetchTokenInfo(mintsToFetch)
    }
  }, [[...mints].sort().join(',')]) // Sort to ensure stable key

  return { tokenInfo, loading }
}

// Simple current price cache
const CURRENT_PRICE_CACHE = new Map<
  string,
  { price: number; timestamp: number }
>()
const PRICE_CACHE_DURATION = 30 * 1000 // 30 seconds

// Hook to fetch current token prices
function useCurrentPrices(mints: string[]) {
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPrices = async (mintsToFetch: string[]) => {
      if (mintsToFetch.length === 0) return

      setLoading(true)

      try {
        // Use Jupiter price API for current prices
        const mintParams = mintsToFetch.join(',')
        const response = await fetch(
          `https://price.jup.ag/v4/price?ids=${mintParams}`
        )

        if (response.ok) {
          const data = await response.json()
          const newPrices: Record<string, number> = {}

          mintsToFetch.forEach((mint) => {
            const priceData = data.data?.[mint]
            if (priceData?.price) {
              const price = parseFloat(priceData.price)
              newPrices[mint] = price

              // Cache the price
              CURRENT_PRICE_CACHE.set(mint, {
                price,
                timestamp: Date.now(),
              })
            }
          })

          setPrices((prev) => ({ ...prev, ...newPrices }))
        }
      } catch (error) {
        console.warn('Failed to fetch current prices:', error)
      }

      setLoading(false)
    }

    const now = Date.now()
    const mintsToFetch: string[] = []
    const cachedPrices: Record<string, number> = {}

    // Check cache first
    mints.forEach((mint) => {
      const cached = CURRENT_PRICE_CACHE.get(mint)
      if (cached && now - cached.timestamp < PRICE_CACHE_DURATION) {
        cachedPrices[mint] = cached.price
      } else {
        mintsToFetch.push(mint)
      }
    })

    // Set cached prices immediately
    if (Object.keys(cachedPrices).length > 0) {
      setPrices((prev) => ({ ...prev, ...cachedPrices }))
    }

    // Fetch missing prices
    if (mintsToFetch.length > 0) {
      fetchPrices(mintsToFetch)
    }
  }, [[...mints].sort().join(',')]) // Sort to ensure stable key

  return { prices, loading }
}

// Better precision formatting for crypto values
function formatCryptoValue(
  usdValue: number,
  currency: 'SOL' | 'USD',
  solPrice: number | null
) {
  if (currency === 'SOL' && solPrice && solPrice > 0) {
    return `${(usdValue / solPrice).toFixed(6)} SOL`
  }
  // Use more precision for small USD amounts (common in crypto)
  if (Math.abs(usdValue) < 0.01) {
    return `$${usdValue.toFixed(8)}`
  } else if (Math.abs(usdValue) < 1) {
    return `$${usdValue.toFixed(6)}`
  } else if (Math.abs(usdValue) < 100) {
    return `$${usdValue.toFixed(4)}`
  }
  return `$${usdValue.toFixed(2)}`
}

// Types from the API
interface TokenPosition {
  mint: string
  symbol: string
  totalBought: number
  totalSold: number
  remainingTokens: number
  totalCostUSD: number
  totalRevenueUSD: number
  realizedPnLUSD: number
  isOpen: boolean
  transactions: any[]
  averageBuyPriceUSD: number
  averageSellPriceUSD: number
  positionId: string
  isIncomplete: boolean
  incompleteReason?: string
  soldAmount?: number
  soldPrice?: number
  costBasis?: number
}

interface WalletPnLStats {
  walletAddress: string
  realizedPnLUSD: number
  tradeCount: number
  winRate: number
  bestTrade: {
    profit: number
    token: string
  }
  dateRange: {
    since?: number
    until?: number
  }
  positions?: TokenPosition[]
}

// Enhanced TokenPosition interface with token info
interface EnrichedTokenPosition extends TokenPosition {
  name: string
  image?: string
}

// Hook to fetch wallet PnL and positions from API
export function useWalletPnL(walletAddress: string | null, enabled: boolean) {
  const [data, setData] = useState<WalletPnLStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !walletAddress) {
      setData(null)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          walletAddress,
          includePositions: 'true',
          limit: '200',
        })

        const response = await fetch(`/api/pnl-wallet?${params.toString()}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`)
        }

        const result = await response.json()
        setData(result.stats)
      } catch (err) {
        console.error('Failed to fetch wallet PnL:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [walletAddress, enabled])

  return { data, loading, error }
}

// Enhanced Token Display Component
function TokenDisplay({
  position,
  isOpen = true,
}: {
  position: EnrichedTokenPosition
  isOpen?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      {position.image ? (
        <img
          src={position.image}
          alt={position.symbol}
          className="w-10 h-10 rounded-full"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const fallback = target.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'flex'
          }}
        />
      ) : null}
      <div
        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold"
        style={{
          display: position.image ? 'none' : 'flex',
        }}
      >
        {position.symbol.substring(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-semibold">{position.symbol}</div>
          {!isOpen && <span className="text-xs text-green-400">✅</span>}
          {position.isIncomplete && (
            <span
              className="text-xs text-yellow-400 cursor-help"
              title={position.incompleteReason}
            >
              ⚠️
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500">{position.name}</div>
        <div className="text-xs">
          <SolanaAddressDisplay
            address={position.mint}
            displayText={`${position.mint.substring(0, 8)}...`}
            className="text-gray-400 hover:text-gray-300"
            showTooltip={false}
            fullAddressOnHover={false}
          />
        </div>
        {position.isIncomplete && (
          <div className="text-xs text-yellow-400 mt-1">
            {position.incompleteReason}
          </div>
        )}
      </div>
    </div>
  )
}

interface InventoryModalProps {
  isOpen: boolean
  onClose: () => void
  currency: 'SOL' | 'USD'
  solPrice: number | null
}

export function SimpleInventoryModal({
  isOpen,
  onClose,
  currency,
  solPrice,
}: InventoryModalProps) {
  const { walletAddress, loading: walletLoading } = useCurrentWallet()
  const { setOpen: setSwapOpen, setInputs } = useSwapStore()
  const { isMobile } = useIsMobile()

  // State for collapsible sections
  const [showOpenPositions, setShowOpenPositions] = useState(true)
  const [showClosedPositions, setShowClosedPositions] = useState(true)

  // Fetch PnL data and positions from API
  const {
    data: pnlData,
    loading: pnlLoading,
    error: pnlError,
  } = useWalletPnL(walletAddress, isOpen && !!walletAddress && !walletLoading)

  const positions = pnlData?.positions || []

  // Get unique mints for token info fetching
  const uniqueMints = useMemo(() => {
    if (!positions || positions.length === 0) {
      return []
    }
    const mints = positions.map((p) => p.mint)
    return [...new Set(mints)]
  }, [positions])

  // Fetch token info for all positions with caching
  const { tokenInfo, loading: loadingTokenInfo } = useTokenInfo(uniqueMints)

  // Fetch current prices for all positions
  const { prices: currentPrices, loading: loadingPrices } =
    useCurrentPrices(uniqueMints)

  // Enrich positions with token info
  const enrichedPositions: EnrichedTokenPosition[] = useMemo(() => {
    return positions.map((position) => ({
      ...position,
      symbol: tokenInfo[position.mint]?.symbol || position.symbol,
      name: tokenInfo[position.mint]?.name || position.symbol,
      image: tokenInfo[position.mint]?.image,
    }))
  }, [positions, tokenInfo])

  const openPositions = enrichedPositions.filter((p) => p.isOpen)
  const closedPositions = enrichedPositions.filter((p) => !p.isOpen)

  // Calculate portfolio stats
  const stats = useMemo(() => {
    if (!pnlData) return null

    // Only count positions with complete data for accurate stats
    const completePositions = enrichedPositions.filter((p) => !p.isIncomplete)
    const incompletePositions = enrichedPositions.filter((p) => p.isIncomplete)

    const totalInvested = completePositions.reduce(
      (sum, p) => sum + p.totalCostUSD,
      0
    )
    const openInvested = openPositions
      .filter((p) => !p.isIncomplete)
      .reduce((sum, p) => sum + p.totalCostUSD, 0)

    const winningPositions = completePositions.filter(
      (p) => p.realizedPnLUSD > 0
    ).length
    const losingPositions = completePositions.filter(
      (p) => p.realizedPnLUSD < 0
    ).length

    return {
      totalInvested,
      openValue: openInvested,
      totalRealized: pnlData.realizedPnLUSD,
      winningPositions,
      losingPositions,
      incompleteCount: incompletePositions.length,
      totalPositions: enrichedPositions.length,
      tradeCount: pnlData.tradeCount,
      winRate: pnlData.winRate,
    }
  }, [pnlData, enrichedPositions, openPositions])

  const formatValue = (usdValue: number) =>
    formatCryptoValue(usdValue, currency, solPrice)

  const handleSell = (mint: string, amount: number) => {
    onClose()
    setSwapOpen(true)
    setInputs({
      inputMint: mint,
      outputMint: 'So11111111111111111111111111111111111111112', // SOL
      inputAmount: amount,
    })
  }

  const isLoading = pnlLoading || loadingTokenInfo || loadingPrices

  if (!walletAddress && !walletLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[85vh] overflow-hidden bg-black/95 border-white/10">
          <DialogHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <DialogTitle className="text-xl font-bold">Inventory</DialogTitle>
            </div>
            <DialogDescription className="text-gray-400">
              Please connect your wallet to view inventory
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center flex-1">
            <p className="text-gray-400">
              Please connect your wallet to view inventory
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] overflow-hidden bg-black/95 border-white/10 flex flex-col">
        {/* Compact Header */}
        <DialogHeader className="shrink-0 border-b border-white/10 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <DialogTitle className="text-xl font-bold">Inventory</DialogTitle>
              {isLoading && (
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              )}
            </div>

            {/* Currency Display */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-white/10 text-white">
                <DollarSign size={14} />
                <span>{currency}</span>
              </div>
            </div>
          </div>

          {/* Compact Portfolio Stats */}
          {stats && (
            <div
              className={`grid gap-2 mt-3 ${
                isMobile ? 'grid-cols-2' : 'grid-cols-5'
              }`}
            >
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-xs text-gray-400">Invested</div>
                <div className="text-sm font-bold">
                  {formatValue(stats.totalInvested)}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-xs text-gray-400">Open Basis</div>
                <div className="text-sm font-bold">
                  {formatValue(stats.openValue)}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-xs text-gray-400">Realized P&L</div>
                <div
                  className={`text-sm font-bold ${
                    stats.totalRealized >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {stats.totalRealized >= 0 ? '+' : ''}
                  {formatValue(stats.totalRealized)}
                </div>
              </div>
              {!isMobile && (
                <>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-xs text-gray-400">Win Rate</div>
                    <div className="text-sm font-bold">
                      {stats.winningPositions}/
                      {stats.winningPositions + stats.losingPositions}
                      <span className="text-xs text-gray-400 ml-1">
                        ({stats.winRate.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-xs text-gray-400">Positions</div>
                    <div className="text-sm font-bold">
                      {openPositions.length} open, {closedPositions.length}{' '}
                      closed
                      {stats.incompleteCount > 0 && (
                        <div className="text-xs text-yellow-400">
                          {stats.incompleteCount} incomplete
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Notice */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mt-2">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-medium">
              ℹ️{' '}
              <span>
                Now using the same PnL calculation as the leaderboard. Each sell
                transaction creates a separate closed position.
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Positions List - Takes remaining space */}
        <div className="flex-1 overflow-y-auto">
          {pnlError ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Package className="w-12 h-12 text-red-600 mb-3" />
              <p className="text-red-400">Error loading positions</p>
              <p className="text-sm text-gray-500 mt-1">{pnlError}</p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Package className="w-12 h-12 text-gray-600 mb-3 animate-pulse" />
              <p className="text-gray-400">Loading positions...</p>
            </div>
          ) : enrichedPositions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Package className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400">No positions found</p>
              <p className="text-sm text-gray-500 mt-1">
                Buy some tokens to see them here
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {/* Open Positions Section */}
              {openPositions.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowOpenPositions(!showOpenPositions)}
                    className="flex items-center gap-2 text-lg font-semibold text-green-400 hover:text-green-300 mb-3 w-full"
                  >
                    {showOpenPositions ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    Open Positions ({openPositions.length})
                  </button>

                  {showOpenPositions && (
                    <>
                      {isMobile ? (
                        <div className="space-y-3">
                          {openPositions.map((position) => (
                            <div
                              key={position.positionId}
                              className="bg-white/5 rounded-xl p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <TokenDisplay
                                  position={position}
                                  isOpen={true}
                                />
                                <div className="text-right">
                                  <div className="text-xs text-gray-500 mb-1">
                                    {position.remainingTokens.toFixed(2)} tokens
                                  </div>
                                  {currentPrices[position.mint] ? (
                                    <>
                                      <div
                                        className={`font-bold ${
                                          currentPrices[position.mint] *
                                            position.remainingTokens -
                                            position.totalCostUSD *
                                              (position.remainingTokens /
                                                position.totalBought) >=
                                          0
                                            ? 'text-green-400'
                                            : 'text-red-400'
                                        }`}
                                      >
                                        {currentPrices[position.mint] *
                                          position.remainingTokens -
                                          position.totalCostUSD *
                                            (position.remainingTokens /
                                              position.totalBought) >=
                                        0
                                          ? '+'
                                          : ''}
                                        {formatCryptoValue(
                                          currentPrices[position.mint] *
                                            position.remainingTokens -
                                            position.totalCostUSD *
                                              (position.remainingTokens /
                                                position.totalBought),
                                          currency,
                                          solPrice
                                        )}
                                      </div>
                                      <div className="text-sm text-gray-400">
                                        (
                                        {currentPrices[position.mint] *
                                          position.remainingTokens -
                                          position.totalCostUSD *
                                            (position.remainingTokens /
                                              position.totalBought) >=
                                        0
                                          ? '+'
                                          : ''}
                                        {(position.totalCostUSD *
                                          (position.remainingTokens /
                                            position.totalBought) >
                                        0
                                          ? ((currentPrices[position.mint] *
                                              position.remainingTokens -
                                              position.totalCostUSD *
                                                (position.remainingTokens /
                                                  position.totalBought)) /
                                              (position.totalCostUSD *
                                                (position.remainingTokens /
                                                  position.totalBought))) *
                                            100
                                          : 0
                                        ).toFixed(1)}
                                        %)
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-sm text-gray-400">
                                      Loading...
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleSell(
                                      position.mint,
                                      position.remainingTokens
                                    )
                                  }
                                  className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-sm font-medium text-red-400"
                                >
                                  Sell All
                                </button>
                                <button
                                  onClick={() =>
                                    handleSell(
                                      position.mint,
                                      position.remainingTokens / 2
                                    )
                                  }
                                  className="flex-1 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 rounded-lg text-sm font-medium text-orange-400"
                                >
                                  Sell 50%
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="text-sm text-gray-400 border-b border-white/10">
                                <th className="text-left py-3 px-2">Token</th>
                                <th className="text-right py-3 px-2">Amount</th>
                                <th className="text-right py-3 px-2">
                                  Current Value
                                </th>
                                <th className="text-right py-3 px-2">Cost</th>
                                <th className="text-right py-3 px-2">P&L</th>
                                <th className="text-right py-3 px-2">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {openPositions.map((position) => {
                                const costBasis =
                                  position.totalCostUSD *
                                  (position.remainingTokens /
                                    position.totalBought)
                                const currentValue = currentPrices[
                                  position.mint
                                ]
                                  ? currentPrices[position.mint] *
                                    position.remainingTokens
                                  : 0
                                const pnl = currentValue - costBasis
                                const pnlPercent =
                                  costBasis > 0 ? (pnl / costBasis) * 100 : 0

                                return (
                                  <tr
                                    key={position.positionId}
                                    className="border-b border-white/5 hover:bg-white/5"
                                  >
                                    <td className="py-4 px-2">
                                      <TokenDisplay
                                        position={position}
                                        isOpen={true}
                                      />
                                    </td>
                                    <td className="text-right py-4 px-2">
                                      {position.remainingTokens.toFixed(2)}
                                    </td>
                                    <td className="text-right py-4 px-2">
                                      {currentPrices[position.mint] ? (
                                        formatCryptoValue(
                                          currentValue,
                                          currency,
                                          solPrice
                                        )
                                      ) : (
                                        <span className="text-gray-500">
                                          --
                                        </span>
                                      )}
                                    </td>
                                    <td className="text-right py-4 px-2">
                                      {formatCryptoValue(
                                        costBasis,
                                        currency,
                                        solPrice
                                      )}
                                    </td>
                                    <td
                                      className={`text-right py-4 px-2 font-medium ${
                                        pnl >= 0
                                          ? 'text-green-400'
                                          : 'text-red-400'
                                      }`}
                                    >
                                      {currentPrices[position.mint] ? (
                                        <div className="flex items-center justify-end gap-1">
                                          {pnl >= 0 ? (
                                            <TrendingUp size={14} />
                                          ) : (
                                            <TrendingDown size={14} />
                                          )}
                                          <span>
                                            {pnl >= 0 ? '+' : ''}
                                            {formatCryptoValue(
                                              pnl,
                                              currency,
                                              solPrice
                                            )}
                                            <span className="text-xs ml-1">
                                              ({pnl >= 0 ? '+' : ''}
                                              {pnlPercent.toFixed(1)}%)
                                            </span>
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-gray-500">
                                          --
                                        </span>
                                      )}
                                    </td>
                                    <td className="text-right py-4 px-2">
                                      <div className="flex justify-end gap-2">
                                        <button
                                          onClick={() =>
                                            handleSell(
                                              position.mint,
                                              position.remainingTokens
                                            )
                                          }
                                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-xs font-medium text-red-400"
                                        >
                                          Sell All
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleSell(
                                              position.mint,
                                              position.remainingTokens / 2
                                            )
                                          }
                                          className="px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 rounded-lg text-xs font-medium text-orange-400"
                                        >
                                          50%
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Closed Positions Section */}
              {closedPositions.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowClosedPositions(!showClosedPositions)}
                    className="flex items-center gap-2 text-lg font-semibold text-gray-400 hover:text-gray-300 mb-3 w-full"
                  >
                    {showClosedPositions ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    Closed Positions ({closedPositions.length})
                  </button>

                  {showClosedPositions && (
                    <>
                      {isMobile ? (
                        <div className="space-y-3">
                          {closedPositions.map((position) => {
                            const pnlPercent =
                              position.totalCostUSD > 0
                                ? (position.realizedPnLUSD /
                                    position.totalCostUSD) *
                                  100
                                : 0
                            const sellTransaction = position.transactions[0]
                            const sellDate = sellTransaction
                              ? new Date(
                                  sellTransaction.timestamp
                                ).toLocaleDateString()
                              : 'N/A'

                            return (
                              <div
                                key={position.positionId}
                                className="bg-white/5 rounded-xl p-4"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <TokenDisplay
                                    position={position}
                                    isOpen={false}
                                  />
                                  <div className="text-right">
                                    <div
                                      className={`font-bold ${
                                        position.realizedPnLUSD >= 0
                                          ? 'text-green-400'
                                          : 'text-red-400'
                                      }`}
                                    >
                                      {position.isIncomplete ? (
                                        <span className="text-yellow-400">
                                          --
                                        </span>
                                      ) : (
                                        <>
                                          {position.realizedPnLUSD >= 0
                                            ? '+'
                                            : ''}
                                          {formatCryptoValue(
                                            position.realizedPnLUSD,
                                            currency,
                                            solPrice
                                          )}
                                        </>
                                      )}
                                    </div>
                                    {!position.isIncomplete && (
                                      <div className="text-sm text-gray-400">
                                        ({pnlPercent >= 0 ? '+' : ''}
                                        {pnlPercent.toFixed(1)}%)
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-500">
                                      {position.soldAmount?.toFixed(2) ||
                                        position.totalSold.toFixed(2)}{' '}
                                      tokens sold
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {sellDate}
                                    </div>
                                  </div>
                                </div>
                                <div className="py-2 bg-gray-600/20 rounded-lg text-sm font-medium text-gray-400 text-center">
                                  Position Closed
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="text-sm text-gray-400 border-b border-white/10">
                                <th className="text-left py-3 px-2">Token</th>
                                <th className="text-right py-3 px-2">Amount</th>
                                <th className="text-right py-3 px-2">
                                  Avg Buy
                                </th>
                                <th className="text-right py-3 px-2">
                                  Avg Sell
                                </th>
                                <th className="text-right py-3 px-2">
                                  Invested
                                </th>
                                <th className="text-right py-3 px-2">
                                  Realized P&L
                                </th>
                                <th className="text-right py-3 px-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {closedPositions.map((position) => {
                                const pnlPercent =
                                  position.totalCostUSD > 0
                                    ? (position.realizedPnLUSD /
                                        position.totalCostUSD) *
                                      100
                                    : 0
                                const sellTransaction = position.transactions[0]
                                const sellDate = sellTransaction
                                  ? new Date(
                                      sellTransaction.timestamp
                                    ).toLocaleDateString()
                                  : 'N/A'

                                return (
                                  <tr
                                    key={position.positionId}
                                    className="border-b border-white/5 hover:bg-white/5"
                                  >
                                    <td className="py-4 px-2">
                                      <TokenDisplay
                                        position={position}
                                        isOpen={false}
                                      />
                                    </td>
                                    <td className="text-right py-4 px-2">
                                      <div>
                                        {(
                                          position.soldAmount ||
                                          position.totalSold
                                        ).toFixed(2)}{' '}
                                        sold
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {sellDate}
                                      </div>
                                    </td>
                                    <td className="text-right py-4 px-2">
                                      {position.isIncomplete ? (
                                        <span className="text-yellow-400">
                                          --
                                        </span>
                                      ) : (
                                        formatCryptoValue(
                                          position.averageBuyPriceUSD,
                                          currency,
                                          solPrice
                                        )
                                      )}
                                    </td>
                                    <td className="text-right py-4 px-2">
                                      {position.isIncomplete ? (
                                        <span className="text-yellow-400">
                                          --
                                        </span>
                                      ) : (
                                        formatCryptoValue(
                                          position.averageSellPriceUSD,
                                          currency,
                                          solPrice
                                        )
                                      )}
                                    </td>
                                    <td className="text-right py-4 px-2">
                                      {position.isIncomplete ? (
                                        <span className="text-yellow-400">
                                          --
                                        </span>
                                      ) : (
                                        formatCryptoValue(
                                          position.totalCostUSD,
                                          currency,
                                          solPrice
                                        )
                                      )}
                                    </td>
                                    <td
                                      className={`text-right py-4 px-2 font-medium ${
                                        position.isIncomplete
                                          ? 'text-yellow-400'
                                          : position.realizedPnLUSD >= 0
                                          ? 'text-green-400'
                                          : 'text-red-400'
                                      }`}
                                    >
                                      {position.isIncomplete ? (
                                        <span>Data Incomplete</span>
                                      ) : (
                                        <div className="flex items-center justify-end gap-1">
                                          {position.realizedPnLUSD >= 0 ? (
                                            <TrendingUp size={14} />
                                          ) : (
                                            <TrendingDown size={14} />
                                          )}
                                          <span>
                                            {position.realizedPnLUSD >= 0
                                              ? '+'
                                              : ''}
                                            {formatCryptoValue(
                                              position.realizedPnLUSD,
                                              currency,
                                              solPrice
                                            )}
                                            <span className="text-xs ml-1">
                                              ({pnlPercent >= 0 ? '+' : ''}
                                              {pnlPercent.toFixed(1)}%)
                                            </span>
                                          </span>
                                        </div>
                                      )}
                                    </td>
                                    <td className="text-right py-4 px-2">
                                      <div className="text-xs text-gray-400">
                                        Fully Realized
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
