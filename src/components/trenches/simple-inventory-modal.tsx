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

// Transaction interface based on the API TradeLogSchema
interface TradeTransaction {
  id?: number
  transactionSignature: string
  walletAddress: string
  profileId?: string
  inputMint: string
  outputMint: string
  inputAmount: number
  outputAmount: number
  inputValueSOL: number
  outputValueSOL: number
  inputValueUSD?: number
  outputValueUSD?: number
  solPrice?: number
  timestamp: number
  source?: string
  slippage?: number
  priorityFee?: number
  tradeType: 'buy' | 'sell' | 'swap'
  platform: 'trenches' | 'main'
  sourceWallet?: string
  sourceTransactionId?: string
}

interface TokenPosition {
  mint: string
  symbol: string
  totalBought: number // total tokens bought
  totalSold: number // total tokens sold
  remainingTokens: number // bought - sold
  totalCostUSD: number // total USD spent buying
  totalRevenueUSD: number // total USD received selling
  realizedPnLUSD: number // revenue - cost for sold portion
  isOpen: boolean // has remaining tokens
  transactions: TradeTransaction[]
  averageBuyPriceUSD: number // cost per token bought
  averageSellPriceUSD: number // revenue per token sold
}

// Enhanced TokenPosition interface with token info
interface EnrichedTokenPosition extends TokenPosition {
  name: string
  image?: string
}

// Simple position calculator using transaction USD values
function calculatePositions(transactions: TradeTransaction[]): TokenPosition[] {
  const positionMap = new Map<string, TokenPosition>()

  // Group transactions by token mint
  transactions.forEach((tx) => {
    if (tx.tradeType === 'swap') return // Skip swaps for now

    const isBuy = tx.tradeType === 'buy'
    const tokenMint = isBuy ? tx.outputMint : tx.inputMint

    // Skip SOL transactions
    if (tokenMint === 'So11111111111111111111111111111111111111112') return

    if (!positionMap.has(tokenMint)) {
      positionMap.set(tokenMint, {
        mint: tokenMint,
        symbol: tokenMint.substring(0, 8), // Use first 8 chars as symbol
        totalBought: 0,
        totalSold: 0,
        remainingTokens: 0,
        totalCostUSD: 0,
        totalRevenueUSD: 0,
        realizedPnLUSD: 0,
        isOpen: false,
        transactions: [],
        averageBuyPriceUSD: 0,
        averageSellPriceUSD: 0,
      })
    }

    const position = positionMap.get(tokenMint)!
    position.transactions.push(tx)

    if (isBuy) {
      position.totalBought += tx.outputAmount
      position.totalCostUSD += tx.inputValueUSD || 0
      if (!tx.inputValueUSD) {
        console.log('tx missing inputValueUSD: ', tx)
      }
    } else {
      position.totalSold += tx.inputAmount
      position.totalRevenueUSD += tx.outputValueUSD || 0
      if (!tx.outputValueUSD) {
        console.log('tx missing outputValueUSD: ', tx)
      }
    }
  })

  // Calculate final position stats
  const positions: TokenPosition[] = []
  positionMap.forEach((position) => {
    position.remainingTokens = position.totalBought - position.totalSold
    position.isOpen = position.remainingTokens > 0.001
    position.realizedPnLUSD = position.totalRevenueUSD - position.totalCostUSD
    position.averageBuyPriceUSD =
      position.totalBought > 0
        ? position.totalCostUSD / position.totalBought
        : 0
    position.averageSellPriceUSD =
      position.totalSold > 0 ? position.totalRevenueUSD / position.totalSold : 0

    // Sort transactions by timestamp
    position.transactions.sort((a, b) => a.timestamp - b.timestamp)

    if (position.totalBought > 0) {
      positions.push(position)
    }
  })

  return positions
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

// Open Position Component
function OpenPosition({
  position,
  currency,
  solPrice,
  currentPrice,
  onSell,
}: {
  position: EnrichedTokenPosition
  currency: 'SOL' | 'USD'
  solPrice: number | null
  currentPrice?: number
  onSell: (mint: string, amount: number) => void
}) {
  const { isMobile } = useIsMobile()

  const formatValue = (usdValue: number) =>
    formatCryptoValue(usdValue, currency, solPrice)

  const costBasis =
    position.totalCostUSD * (position.remainingTokens / position.totalBought)
  const currentValue = currentPrice
    ? currentPrice * position.remainingTokens
    : 0
  const pnl = currentValue - costBasis
  const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0

  if (isMobile) {
    return (
      <div className="bg-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <TokenDisplay position={position} isOpen={true} />
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">
              {position.remainingTokens.toFixed(2)} tokens
            </div>
            {currentPrice ? (
              <>
                <div
                  className={`font-bold ${
                    pnl >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {pnl >= 0 ? '+' : ''}
                  {formatValue(pnl)}
                </div>
                <div className="text-sm text-gray-400">
                  ({pnl >= 0 ? '+' : ''}
                  {pnlPercent.toFixed(1)}%)
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400">Loading...</div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onSell(position.mint, position.remainingTokens)}
            className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-sm font-medium text-red-400"
          >
            Sell All
          </button>
          <button
            onClick={() => onSell(position.mint, position.remainingTokens / 2)}
            className="flex-1 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 rounded-lg text-sm font-medium text-orange-400"
          >
            Sell 50%
          </button>
        </div>
      </div>
    )
  }

  return (
    <tr className="border-b border-white/5 hover:bg-white/5">
      <td className="py-4 px-2">
        <TokenDisplay position={position} isOpen={true} />
      </td>
      <td className="text-right py-4 px-2">
        {position.remainingTokens.toFixed(2)}
      </td>
      <td className="text-right py-4 px-2">
        {currentPrice ? (
          formatValue(currentValue)
        ) : (
          <span className="text-gray-500">--</span>
        )}
      </td>
      <td className="text-right py-4 px-2">{formatValue(costBasis)}</td>
      <td
        className={`text-right py-4 px-2 font-medium ${
          pnl >= 0 ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {currentPrice ? (
          <div className="flex items-center justify-end gap-1">
            {pnl >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>
              {pnl >= 0 ? '+' : ''}
              {formatValue(pnl)}
              <span className="text-xs ml-1">
                ({pnl >= 0 ? '+' : ''}
                {pnlPercent.toFixed(1)}%)
              </span>
            </span>
          </div>
        ) : (
          <span className="text-gray-500">--</span>
        )}
      </td>
      <td className="text-right py-4 px-2">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onSell(position.mint, position.remainingTokens)}
            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-xs font-medium text-red-400"
          >
            Sell All
          </button>
          <button
            onClick={() => onSell(position.mint, position.remainingTokens / 2)}
            className="px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 rounded-lg text-xs font-medium text-orange-400"
          >
            50%
          </button>
        </div>
      </td>
    </tr>
  )
}

// Closed Position Component
function ClosedPosition({
  position,
  currency,
  solPrice,
}: {
  position: EnrichedTokenPosition
  currency: 'SOL' | 'USD'
  solPrice: number | null
}) {
  const { isMobile } = useIsMobile()

  const formatValue = (usdValue: number) =>
    formatCryptoValue(usdValue, currency, solPrice)

  const pnlPercent =
    position.totalCostUSD > 0
      ? (position.realizedPnLUSD / position.totalCostUSD) * 100
      : 0

  if (isMobile) {
    return (
      <div className="bg-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <TokenDisplay position={position} isOpen={false} />
          <div className="text-right">
            <div
              className={`font-bold ${
                position.realizedPnLUSD >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
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
        <div className="py-2 bg-gray-600/20 rounded-lg text-sm font-medium text-gray-400 text-center">
          Position Closed
        </div>
      </div>
    )
  }

  return (
    <tr className="border-b border-white/5 hover:bg-white/5">
      <td className="py-4 px-2">
        <TokenDisplay position={position} isOpen={false} />
      </td>
      <td className="text-right py-4 px-2">
        {position.totalSold.toFixed(2)} sold
      </td>
      <td className="text-right py-4 px-2">
        {formatValue(position.averageBuyPriceUSD)}
      </td>
      <td className="text-right py-4 px-2">
        {formatValue(position.averageSellPriceUSD)}
      </td>
      <td className="text-right py-4 px-2">
        {formatValue(position.totalCostUSD)}
      </td>
      <td
        className={`text-right py-4 px-2 font-medium ${
          position.realizedPnLUSD >= 0 ? 'text-green-400' : 'text-red-400'
        }`}
      >
        <div className="flex items-center justify-end gap-1">
          {position.realizedPnLUSD >= 0 ? (
            <TrendingUp size={14} />
          ) : (
            <TrendingDown size={14} />
          )}
          <span>
            {position.realizedPnLUSD >= 0 ? '+' : ''}
            {formatValue(position.realizedPnLUSD)}
            <span className="text-xs ml-1">
              ({pnlPercent >= 0 ? '+' : ''}
              {pnlPercent.toFixed(1)}%)
            </span>
          </span>
        </div>
      </td>
      <td className="text-right py-4 px-2">
        <div className="text-xs text-gray-400">Fully Realized</div>
      </td>
    </tr>
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

  // Fetch transaction history - only when modal is open
  const { transactions, meta, isLoading, isError } =
    useTapestryTransactionHistory(walletAddress || '', {
      enabled: isOpen && !!walletAddress && !walletLoading,
      limit: 200, // Get more transactions for better position calculation
      sortOrder: 'desc',
    })

  // Calculate positions from transactions - prevent unnecessary recalculations
  const positions = useMemo(() => {
    // Skip recalculation if we're still loading or already have positions
    if (isLoading || !transactions || transactions.length === 0) {
      return []
    }

    // Cast transactions to proper type and filter valid ones
    const validTransactions = transactions
      .filter(
        (tx: any) =>
          tx.transactionSignature &&
          (tx.inputValueUSD || tx.outputValueUSD) &&
          tx.tradeType !== 'swap'
      )
      .map((tx: any) => tx as TradeTransaction)

    const result = calculatePositions(validTransactions)

    return result
  }, [transactions, isLoading])

  // Get unique mints for token info fetching - prevent unnecessary recalculations
  const uniqueMints = useMemo(() => {
    if (!positions || positions.length === 0) {
      return []
    }
    const mints = positions.map((p) => p.mint)
    const uniqueMints = [...new Set(mints)] // Remove duplicates
    return uniqueMints
  }, [positions.length, positions.map((p) => p.mint).join(',')]) // More stable dependency array

  // Fetch token info for all positions with caching - only if we have mints
  const { tokenInfo, loading: loadingTokenInfo } = useTokenInfo(
    uniqueMints.length > 0 ? uniqueMints : []
  )

  // Fetch current prices for all positions - only if we have mints
  const { prices: currentPrices, loading: loadingPrices } = useCurrentPrices(
    uniqueMints.length > 0 ? uniqueMints : []
  )

  // Enrich positions with token info
  const enrichedPositions: EnrichedTokenPosition[] = useMemo(() => {
    return positions.map((position) => ({
      ...position,
      symbol: tokenInfo[position.mint]?.symbol || position.symbol,
      name: tokenInfo[position.mint]?.name || position.symbol,
      image: tokenInfo[position.mint]?.image,
    }))
  }, [
    positions.length,
    positions.map((p) => p.mint).join(','),
    Object.keys(tokenInfo).length,
    JSON.stringify(tokenInfo),
  ])

  const openPositions = enrichedPositions.filter((p) => p.isOpen)
  const closedPositions = enrichedPositions.filter((p) => !p.isOpen)

  // Calculate portfolio stats
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
      openValue: openInvested, // Cost basis of open positions
      totalRealized,
      winningPositions: enrichedPositions.filter((p) => p.realizedPnLUSD > 0)
        .length,
      losingPositions: enrichedPositions.filter((p) => p.realizedPnLUSD < 0)
        .length,
    }
  }, [enrichedPositions, openPositions])

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
              {(loadingTokenInfo || loadingPrices) && (
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
                      (
                      {(
                        (stats.winningPositions /
                          (stats.winningPositions + stats.losingPositions)) *
                          100 || 0
                      ).toFixed(0)}
                      %)
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-xs text-gray-400">Positions</div>
                  <div className="text-sm font-bold">
                    {openPositions.length} open, {closedPositions.length} closed
                  </div>
                </div>
              </>
            )}
          </div>

          {/* WIP Notice - More Compact */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 mt-2">
            <div className="flex items-center gap-2 text-yellow-400 text-xs font-medium">
              🚧 <span>WIP: PnL tracking may not be accurate</span>
            </div>
          </div>
        </DialogHeader>

        {/* Positions List - Takes remaining space */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
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
                            <OpenPosition
                              key={position.mint}
                              position={position}
                              currency={currency}
                              solPrice={solPrice}
                              currentPrice={currentPrices[position.mint]}
                              onSell={handleSell}
                            />
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
                              {openPositions.map((position) => (
                                <OpenPosition
                                  key={position.mint}
                                  position={position}
                                  currency={currency}
                                  solPrice={solPrice}
                                  currentPrice={currentPrices[position.mint]}
                                  onSell={handleSell}
                                />
                              ))}
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
                          {closedPositions.map((position) => (
                            <ClosedPosition
                              key={position.mint}
                              position={position}
                              currency={currency}
                              solPrice={solPrice}
                            />
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
                              {closedPositions.map((position) => (
                                <ClosedPosition
                                  key={position.mint}
                                  position={position}
                                  currency={currency}
                                  solPrice={solPrice}
                                />
                              ))}
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
