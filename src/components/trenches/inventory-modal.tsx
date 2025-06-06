'use client'

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
import { useMemo, useState } from 'react'

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

interface InventoryModalProps {
  isOpen: boolean
  onClose: () => void
  mintMap: Record<string, any>
  currency: 'SOL' | 'USD'
  solPrice: number | null
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
        symbol: tokenMint.substring(0, 8), // Will get real symbol later
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
    } else {
      position.totalSold += tx.inputAmount
      position.totalRevenueUSD += tx.outputValueUSD || 0
    }
  })

  // Calculate final position stats
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

    // Sort transactions by timestamp
    position.transactions.sort((a, b) => a.timestamp - b.timestamp)

    positions.push(position)
  })

  return positions.filter((p) => p.totalBought > 0) // Only show positions where we bought something
}

// Open Position Component
function OpenPosition({
  position,
  currency,
  solPrice,
  onSell,
}: {
  position: TokenPosition
  currency: 'SOL' | 'USD'
  solPrice: number | null
  onSell: (mint: string, amount: number) => void
}) {
  const { isMobile } = useIsMobile()

  const formatValue = (usdValue: number) => {
    if (currency === 'SOL' && solPrice && solPrice > 0) {
      return `${(usdValue / solPrice).toFixed(6)} SOL`
    }
    return `$${usdValue.toFixed(4)}`
  }

  const investedUSD =
    position.totalCostUSD * (position.remainingTokens / position.totalBought)
  const unrealizedPnL = -investedUSD // We don't have current market value, so show as cost basis

  if (isMobile) {
    return (
      <div className="bg-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {position.symbol.substring(0, 2)}
            </div>
            <div>
              <div className="font-semibold">{position.symbol}</div>
              <div className="text-xs text-gray-400">
                {position.remainingTokens.toFixed(2)} tokens
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold">{formatValue(investedUSD)}</div>
            <div className="text-sm text-gray-400">Cost basis</div>
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
            {position.symbol.substring(0, 2)}
          </div>
          <div>
            <div className="font-semibold">{position.symbol}</div>
            <div className="text-sm text-gray-500">Open Position</div>
          </div>
        </div>
      </td>
      <td className="text-right py-4 px-2">
        {position.remainingTokens.toFixed(2)}
      </td>
      <td className="text-right py-4 px-2">
        {formatValue(position.averageBuyPriceUSD)}
      </td>
      <td className="text-right py-4 px-2 text-gray-500">--</td>
      <td className="text-right py-4 px-2">{formatValue(investedUSD)}</td>
      <td className="text-right py-4 px-2 text-gray-500">--</td>
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
  position: TokenPosition
  currency: 'SOL' | 'USD'
  solPrice: number | null
}) {
  const { isMobile } = useIsMobile()

  const formatValue = (usdValue: number) => {
    if (currency === 'SOL' && solPrice && solPrice > 0) {
      return `${(usdValue / solPrice).toFixed(6)} SOL`
    }
    return `$${usdValue.toFixed(4)}`
  }

  const pnlPercent =
    position.totalCostUSD > 0
      ? (position.realizedPnLUSD / position.totalCostUSD) * 100
      : 0

  if (isMobile) {
    return (
      <div className="bg-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white text-xs font-bold">
              {position.symbol.substring(0, 2)}
            </div>
            <div>
              <div className="font-semibold flex items-center gap-1">
                {position.symbol}
                <span className="text-xs text-green-400">✅</span>
              </div>
              <div className="text-xs text-gray-400">
                {position.totalSold.toFixed(2)} tokens sold
              </div>
            </div>
          </div>
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white text-xs font-bold">
            {position.symbol.substring(0, 2)}
          </div>
          <div>
            <div className="font-semibold flex items-center gap-1">
              {position.symbol}
              <span className="text-xs text-green-400">✅</span>
            </div>
            <div className="text-sm text-gray-500">Closed Position</div>
          </div>
        </div>
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

export function InventoryModal({
  isOpen,
  onClose,
  mintMap,
  currency,
  solPrice,
}: InventoryModalProps) {
  const { walletAddress, loading: walletLoading } = useCurrentWallet()
  const { setOpen: setSwapOpen, setInputs } = useSwapStore()
  const [displayMode, setDisplayMode] = useState<'dollars' | 'percent'>(
    'dollars'
  )
  const { isMobile } = useIsMobile()

  // Fetch transaction history
  const { transactions, isLoading, isError } = useTapestryTransactionHistory(
    walletAddress || '',
    isOpen && !!walletAddress
  )

  // Calculate positions from transactions
  const positions = useMemo(() => {
    if (!transactions || transactions.length === 0) return []

    console.log(
      `🔄 Calculating positions from ${transactions.length} transactions`
    )

    // Cast transactions to proper type and filter valid ones
    const validTransactions = transactions
      .filter(
        (tx: any) =>
          tx.transactionSignature && (tx.inputValueUSD || tx.outputValueUSD)
      )
      .map((tx: any) => tx as TradeTransaction)

    console.log(`✅ Processing ${validTransactions.length} valid transactions`)

    return calculatePositions(validTransactions)
  }, [transactions])

  const openPositions = positions.filter((p) => p.isOpen)
  const closedPositions = positions.filter((p) => !p.isOpen)

  // Calculate portfolio stats
  const stats = useMemo(() => {
    const totalInvested = positions.reduce((sum, p) => sum + p.totalCostUSD, 0)
    const totalRealized = positions.reduce(
      (sum, p) => sum + p.realizedPnLUSD,
      0
    )
    const openInvested = openPositions.reduce(
      (sum, p) => sum + p.totalCostUSD * (p.remainingTokens / p.totalBought),
      0
    )

    return {
      totalInvested,
      openValue: openInvested, // We don't have current market prices
      totalRealized,
      winningPositions: positions.filter((p) => p.realizedPnLUSD > 0).length,
      losingPositions: positions.filter((p) => p.realizedPnLUSD < 0).length,
    }
  }, [positions, openPositions])

  const formatValue = (usdValue: number) => {
    if (currency === 'SOL' && solPrice && solPrice > 0) {
      return `${(usdValue / solPrice).toFixed(6)} SOL`
    }
    return `$${usdValue.toFixed(2)}`
  }

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
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-black/95 border-white/10">
          <DialogHeader className="border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <DialogTitle className="text-xl font-bold">Inventory</DialogTitle>
            </div>
            <DialogDescription className="text-gray-400">
              Please connect your wallet to view inventory
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
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
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden bg-black/95 border-white/10">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <DialogTitle className="text-xl font-bold">Inventory</DialogTitle>
            </div>

            {/* Currency Toggle */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setDisplayMode('dollars')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  displayMode === 'dollars'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <DollarSign size={14} />
                <span>{currency}</span>
              </button>
            </div>
          </div>

          <DialogDescription className="text-gray-400">
            View your token positions from trenches trading
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
              <div className="text-xs text-gray-400 mb-1">Open Positions</div>
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
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Positions</div>
              <div className="text-sm font-bold">
                {openPositions.length} open, {closedPositions.length} closed
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Positions List */}
        <div className="overflow-y-auto max-h-[55vh]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-gray-600 mb-3 animate-pulse" />
              <p className="text-gray-400">Loading positions...</p>
            </div>
          ) : positions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400">No positions found</p>
              <p className="text-sm text-gray-500 mt-1">
                Buy some tokens to see them here
              </p>
            </div>
          ) : (
            <>
              {/* Open Positions Section */}
              {openPositions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-green-400">
                    Open Positions ({openPositions.length})
                  </h3>
                  {isMobile ? (
                    <div className="space-y-3 px-2">
                      {openPositions.map((position) => (
                        <OpenPosition
                          key={position.mint}
                          position={position}
                          currency={currency}
                          solPrice={solPrice}
                          onSell={handleSell}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="px-4">
                      <table className="w-full">
                        <thead>
                          <tr className="text-sm text-gray-400 border-b border-white/10">
                            <th className="text-left py-3 px-2">Token</th>
                            <th className="text-right py-3 px-2">Amount</th>
                            <th className="text-right py-3 px-2">Avg Buy</th>
                            <th className="text-right py-3 px-2">Current</th>
                            <th className="text-right py-3 px-2">Value</th>
                            <th className="text-right py-3 px-2">P&L</th>
                            <th className="text-right py-3 px-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {openPositions.map((position) => (
                            <OpenPosition
                              key={position.mint}
                              position={position}
                              currency={currency}
                              solPrice={solPrice}
                              onSell={handleSell}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Closed Positions Section */}
              {closedPositions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-400">
                    Closed Positions ({closedPositions.length})
                  </h3>
                  {isMobile ? (
                    <div className="space-y-3 px-2">
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
                    <div className="px-4">
                      <table className="w-full">
                        <thead>
                          <tr className="text-sm text-gray-400 border-b border-white/10">
                            <th className="text-left py-3 px-2">Token</th>
                            <th className="text-right py-3 px-2">Amount</th>
                            <th className="text-right py-3 px-2">Avg Buy</th>
                            <th className="text-right py-3 px-2">Avg Sell</th>
                            <th className="text-right py-3 px-2">Invested</th>
                            <th className="text-right py-3 px-2">P&L</th>
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
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
