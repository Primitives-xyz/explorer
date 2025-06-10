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
import { useTapestryTransactionHistory } from '@/hooks/use-tapestry-transaction-history'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useIsMobile } from '@/utils/use-is-mobile'
import { DollarSign, Package, TrendingDown, TrendingUp } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface TradeTransaction {
  transactionSignature: string
  inputMint: string
  outputMint: string
  inputAmount: number
  outputAmount: number
  inputValueUSD?: number
  outputValueUSD?: number
  timestamp: number
  tradeType: 'buy' | 'sell' | 'swap'
}

interface TokenPosition {
  mint: string
  symbol: string
  name: string
  image?: string
  totalBought: number
  totalSold: number
  remainingTokens: number
  totalCostUSD: number
  totalRevenueUSD: number
  realizedPnLUSD: number
  isOpen: boolean
  averageBuyPriceUSD: number
  averageSellPriceUSD: number
}

interface TokenInfo {
  symbol: string
  name: string
  image?: string
}

interface SimpleInventoryProps {
  isOpen: boolean
  onClose: () => void
  currency: 'SOL' | 'USD'
  solPrice: number | null
}

// Simple token info cache
const TOKEN_INFO_CACHE = new Map<
  string,
  { info: TokenInfo; timestamp: number }
>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Hook to fetch token info with caching
function useTokenInfo(mints: string[]) {
  const [tokenInfo, setTokenInfo] = useState<Record<string, TokenInfo>>({})
  const [loading, setLoading] = useState(false)

  const fetchTokenInfo = useCallback(async (mintsToFetch: string[]) => {
    if (mintsToFetch.length === 0) return

    setLoading(true)
    console.log(`🔍 Fetching token info for ${mintsToFetch.length} tokens`)

    const fetchPromises = mintsToFetch.map(async (mint) => {
      try {
        const response = await fetch(`/api/token?mint=${mint}`)
        if (response.ok) {
          const data = await response.json()
          const info: TokenInfo = {
            symbol:
              data?.result?.content?.metadata?.symbol || mint.substring(0, 8),
            name: data?.result?.content?.metadata?.name || mint.substring(0, 8),
            image: data?.result?.content?.links?.image,
          }

          // Cache the result
          TOKEN_INFO_CACHE.set(mint, {
            info,
            timestamp: Date.now(),
          })

          console.log(
            `✅ Fetched info for ${mint}: ${info.symbol} (${info.name})`
          )
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
  }, [])

  useEffect(() => {
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
  }, [mints.join(','), fetchTokenInfo])

  return { tokenInfo, loading }
}

function calculatePositions(transactions: TradeTransaction[]): TokenPosition[] {
  const positionMap = new Map<string, TokenPosition>()

  console.log(`🔄 Processing ${transactions.length} transactions`)

  transactions.forEach((tx) => {
    if (tx.tradeType === 'swap') return

    const isBuy = tx.tradeType === 'buy'
    const tokenMint = isBuy ? tx.outputMint : tx.inputMint

    if (tokenMint === 'So11111111111111111111111111111111111111112') return

    if (!positionMap.has(tokenMint)) {
      positionMap.set(tokenMint, {
        mint: tokenMint,
        symbol: tokenMint.substring(0, 8),
        name: tokenMint.substring(0, 8),
        totalBought: 0,
        totalSold: 0,
        remainingTokens: 0,
        totalCostUSD: 0,
        totalRevenueUSD: 0,
        realizedPnLUSD: 0,
        isOpen: false,
        averageBuyPriceUSD: 0,
        averageSellPriceUSD: 0,
      })
    }

    const position = positionMap.get(tokenMint)!

    if (isBuy) {
      position.totalBought += tx.outputAmount
      position.totalCostUSD += tx.inputValueUSD || 0
    } else {
      position.totalSold += tx.inputAmount
      position.totalRevenueUSD += tx.outputValueUSD || 0
    }
  })

  const positions: TokenPosition[] = []
  positionMap.forEach((position) => {
    position.remainingTokens = position.totalBought - position.totalSold
    position.isOpen = position.remainingTokens > 0.001
    position.realizedPnLUSD =
      position.totalRevenueUSD -
      position.totalCostUSD * (position.totalSold / position.totalBought || 0)
    position.averageBuyPriceUSD =
      position.totalBought > 0
        ? position.totalCostUSD / position.totalBought
        : 0
    position.averageSellPriceUSD =
      position.totalSold > 0 ? position.totalRevenueUSD / position.totalSold : 0

    if (position.totalBought > 0) {
      positions.push(position)
    }
  })

  return positions
}

// Token display component with image and contract address
function TokenDisplay({
  position,
  isOpen = true,
}: {
  position: TokenPosition
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
      </div>
    </div>
  )
}

export function SimpleInventory({
  isOpen,
  onClose,
  currency,
  solPrice,
}: SimpleInventoryProps) {
  const { walletAddress } = useCurrentWallet()
  const { setOpen: setSwapOpen, setInputs } = useSwapStore()
  const { isMobile } = useIsMobile()

  const { transactions, isLoading } = useTapestryTransactionHistory(
    walletAddress || '',
    isOpen && !!walletAddress
  )

  const positions = useMemo(() => {
    if (!transactions || transactions.length === 0) return []

    const validTransactions = transactions
      .filter(
        (tx: any) =>
          tx.transactionSignature &&
          (tx.inputValueUSD || tx.outputValueUSD) &&
          tx.tradeType !== 'swap'
      )
      .map((tx: any) => tx as TradeTransaction)

    return calculatePositions(validTransactions)
  }, [transactions])

  // Get unique mints for token info fetching
  const uniqueMints = useMemo(() => {
    return positions.map((p) => p.mint)
  }, [positions])

  // Fetch token info for all positions
  const { tokenInfo, loading: loadingTokenInfo } = useTokenInfo(uniqueMints)

  // Enrich positions with token info
  const enrichedPositions = useMemo(() => {
    return positions.map((position) => ({
      ...position,
      symbol: tokenInfo[position.mint]?.symbol || position.symbol,
      name: tokenInfo[position.mint]?.name || position.name,
      image: tokenInfo[position.mint]?.image,
    }))
  }, [positions, tokenInfo])

  const openPositions = enrichedPositions.filter((p) => p.isOpen)
  const closedPositions = enrichedPositions.filter((p) => !p.isOpen)

  const stats = useMemo(() => {
    const totalInvested = enrichedPositions.reduce(
      (sum, p) => sum + p.totalCostUSD,
      0
    )
    const totalRealized = enrichedPositions.reduce(
      (sum, p) => sum + p.realizedPnLUSD,
      0
    )
    const openInvested = openPositions.reduce(
      (sum, p) => sum + p.totalCostUSD * (p.remainingTokens / p.totalBought),
      0
    )

    return {
      totalInvested,
      openValue: openInvested,
      totalRealized,
      winningPositions: enrichedPositions.filter((p) => p.realizedPnLUSD > 0)
        .length,
      losingPositions: enrichedPositions.filter((p) => p.realizedPnLUSD < 0)
        .length,
    }
  }, [enrichedPositions, openPositions])

  const formatValue = (usdValue: number) => {
    if (currency === 'SOL' && solPrice && solPrice > 0) {
      return `${(usdValue / solPrice).toFixed(4)} SOL`
    }
    return `$${usdValue.toFixed(2)}`
  }

  const handleSell = (mint: string, amount: number) => {
    onClose()
    setSwapOpen(true)
    setInputs({
      inputMint: mint,
      outputMint: 'So11111111111111111111111111111111111111112',
      inputAmount: amount,
    })
  }

  if (!walletAddress) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-black/95 border-white/10">
          <DialogHeader>
            <DialogTitle>Inventory</DialogTitle>
            <DialogDescription>Please connect your wallet</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden bg-black/95 border-white/10">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <DialogTitle className="text-xl font-bold">Inventory</DialogTitle>
              {loadingTokenInfo && (
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              )}
            </div>
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-white/10 text-white">
                <DollarSign size={14} />
                <span>{currency}</span>
              </div>
            </div>
          </div>

          <DialogDescription className="text-gray-400">
            Token positions based on transaction history
          </DialogDescription>

          {/* Portfolio Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Total Invested</div>
              <div className="text-sm font-bold">
                {formatValue(stats.totalInvested)}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Open Cost Basis</div>
              <div className="text-sm font-bold">
                {formatValue(stats.openValue)}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Realized P&L</div>
              <div
                className={`text-sm font-bold ${
                  stats.totalRealized >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {stats.totalRealized >= 0 ? '+' : ''}
                {formatValue(stats.totalRealized)}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Win Rate</div>
              <div className="text-sm font-bold">
                {stats.winningPositions}/
                {stats.winningPositions + stats.losingPositions}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Positions</div>
              <div className="text-sm font-bold">
                {openPositions.length} open, {closedPositions.length} closed
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[55vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Package className="w-12 h-12 text-gray-600 animate-pulse" />
            </div>
          ) : enrichedPositions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400">No positions found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Open Positions */}
              {openPositions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-green-400">
                    Open Positions ({openPositions.length})
                  </h3>
                  <div className="space-y-3">
                    {openPositions.map((position) => {
                      const investedUSD =
                        position.totalCostUSD *
                        (position.remainingTokens / position.totalBought)

                      return (
                        <div
                          key={position.mint}
                          className="bg-white/5 rounded-xl p-4"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <TokenDisplay position={position} isOpen={true} />
                            <div className="text-right ml-auto">
                              <div className="font-bold">
                                {formatValue(investedUSD)}
                              </div>
                              <div className="text-sm text-gray-400">
                                Cost basis
                              </div>
                              <div className="text-xs text-gray-500">
                                {position.remainingTokens.toFixed(2)} tokens
                              </div>
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
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Closed Positions */}
              {closedPositions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-400">
                    Closed Positions ({closedPositions.length})
                  </h3>
                  <div className="space-y-3">
                    {closedPositions.map((position) => {
                      const pnlPercent =
                        position.totalCostUSD > 0
                          ? (position.realizedPnLUSD / position.totalCostUSD) *
                            100
                          : 0

                      return (
                        <div
                          key={position.mint}
                          className="bg-white/5 rounded-xl p-4"
                        >
                          <div className="flex items-start gap-3">
                            <TokenDisplay position={position} isOpen={false} />
                            <div className="text-right ml-auto">
                              <div
                                className={`font-bold flex items-center gap-1 justify-end ${
                                  position.realizedPnLUSD >= 0
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                }`}
                              >
                                {position.realizedPnLUSD >= 0 ? (
                                  <TrendingUp size={14} />
                                ) : (
                                  <TrendingDown size={14} />
                                )}
                                {position.realizedPnLUSD >= 0 ? '+' : ''}
                                {formatValue(position.realizedPnLUSD)}
                              </div>
                              <div className="text-sm text-gray-400">
                                ({pnlPercent >= 0 ? '+' : ''}
                                {pnlPercent.toFixed(1)}%)
                              </div>
                              <div className="text-xs text-gray-500">
                                {position.totalSold.toFixed(2)} tokens sold
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
