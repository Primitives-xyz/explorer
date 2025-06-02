'use client'

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
  DollarSign,
  Package,
  Percent,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useInventoryStore } from './stores/use-inventory-store'
import { InventoryPosition, InventoryStats } from './types/inventory-types'

interface InventoryModalProps {
  isOpen: boolean
  onClose: () => void
  mintMap: Record<string, any>
  currency: 'SOL' | 'USD'
  solPrice: number | null
}

export function InventoryModal({
  isOpen,
  onClose,
  mintMap,
  currency,
  solPrice,
}: InventoryModalProps) {
  const { walletAddress, loading: walletLoading } = useCurrentWallet()
  const { positions, updatePrices } = useInventoryStore()
  const { setOpen: setSwapOpen, setInputs } = useSwapStore()
  const [displayMode, setDisplayMode] = useState<'dollars' | 'percent'>(
    'dollars'
  )
  const { isMobile } = useIsMobile()

  // Filter positions that are in mintMap and calculate stats
  const { activePositions, stats } = useMemo(() => {
    const activePositions: InventoryPosition[] = []
    let totalInvested = 0
    let currentValue = 0
    let winningPositions = 0
    let losingPositions = 0

    Object.values(positions).forEach((position) => {
      const mintInfo = mintMap[position.mint]
      if (mintInfo && position.totalAmount > 0) {
        // Update position with current price from mintMap
        const currentPrice = mintInfo.pricePerToken || 0
        position.currentPrice = currentPrice

        activePositions.push(position)

        totalInvested += position.totalInvested
        const positionValue = position.totalAmount * currentPrice
        currentValue += positionValue

        if (positionValue > position.totalInvested) {
          winningPositions++
        } else {
          losingPositions++
        }
      }
    })

    const totalPnL = currentValue - totalInvested
    const totalPnLPercent =
      totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

    const stats: InventoryStats = {
      totalInvested,
      currentValue,
      totalPnL,
      totalPnLPercent,
      winningPositions,
      losingPositions,
    }

    return { activePositions, stats }
  }, [positions, mintMap])

  const formatValue = (valueInSol: number, decimals: number = 2) => {
    if (currency === 'USD' && solPrice) {
      const valueInUsd = valueInSol * solPrice
      return `$${valueInUsd.toLocaleString(undefined, {
        maximumFractionDigits: decimals,
      })}`
    }
    return `${valueInSol.toLocaleString(undefined, {
      maximumFractionDigits: decimals,
    })} SOL`
  }

  const formatPrice = (priceInSol: number) => {
    if (currency === 'USD' && solPrice) {
      const priceInUsd = priceInSol * solPrice
      return `$${priceInUsd.toFixed(6)}`
    }
    return `${priceInSol.toFixed(8)}`
  }

  const formatPnL = (position: InventoryPosition) => {
    const currentValue = position.totalAmount * position.currentPrice
    const pnl = currentValue - position.totalInvested
    const pnlPercent =
      position.totalInvested > 0 ? (pnl / position.totalInvested) * 100 : 0

    if (displayMode === 'percent') {
      return {
        value: `${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%`,
        isPositive: pnlPercent >= 0,
      }
    }

    return {
      value: `${pnl >= 0 ? '+' : ''}${formatValue(pnl, 4)}`,
      isPositive: pnl >= 0,
    }
  }

  const handleSell = (position: InventoryPosition, amount: number) => {
    onClose()
    setSwapOpen(true)
    setInputs({
      inputMint: position.mint,
      outputMint: 'So11111111111111111111111111111111111111112', // SOL
      inputAmount: amount,
    })
  }

  const formatAmount = (amount: number) => {
    if (amount > 1000000) {
      return `${(amount / 1000000).toFixed(2)}M`
    } else if (amount > 1000) {
      return `${(amount / 1000).toFixed(2)}K`
    }
    return amount.toFixed(2)
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

            {/* Display Mode Toggle */}
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
                <span>Value</span>
              </button>
              <button
                onClick={() => setDisplayMode('percent')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  displayMode === 'percent'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Percent size={14} />
                <span>Percent</span>
              </button>
            </div>
          </div>

          <DialogDescription className="text-gray-400">
            View and manage your token positions from trenches trading
          </DialogDescription>

          {/* Portfolio Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Total Invested</div>
              <div className="text-sm font-bold">
                {formatValue(stats.totalInvested)}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Current Value</div>
              <div className="text-sm font-bold">
                {formatValue(stats.currentValue)}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Total P&L</div>
              <div
                className={`text-sm font-bold ${
                  stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {stats.totalPnL >= 0 ? '+' : ''}
                {formatValue(stats.totalPnL)}
                <span className="text-xs ml-1">
                  ({stats.totalPnLPercent >= 0 ? '+' : ''}
                  {stats.totalPnLPercent.toFixed(2)}%)
                </span>
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
          </div>
        </DialogHeader>

        {/* Positions List */}
        <div className="overflow-y-auto max-h-[55vh]">
          {activePositions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400">No active positions in trenches</p>
              <p className="text-sm text-gray-500 mt-1">
                Buy some tokens to see them here
              </p>
            </div>
          ) : (
            <>
              {isMobile ? (
                // Mobile: Card Layout
                <div className="space-y-3 px-2">
                  {activePositions.map((position) => {
                    const pnl = formatPnL(position)
                    const currentValue =
                      position.totalAmount * position.currentPrice

                    return (
                      <div
                        key={position.mint}
                        className="bg-white/5 rounded-xl p-4 transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {position.image && (
                              <img
                                src={position.image}
                                alt={position.symbol}
                                className="w-10 h-10 rounded-full"
                              />
                            )}
                            <div>
                              <div className="font-semibold">
                                {position.symbol}
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatAmount(position.totalAmount)} tokens
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              {formatValue(currentValue)}
                            </div>
                            <div
                              className={`text-sm ${
                                pnl.isPositive
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {pnl.value}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleSell(position, position.totalAmount)
                            }
                            className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-sm font-medium text-red-400 transition-all"
                          >
                            Sell All
                          </button>
                          <button
                            onClick={() =>
                              handleSell(position, position.totalAmount / 2)
                            }
                            className="flex-1 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 rounded-lg text-sm font-medium text-orange-400 transition-all"
                          >
                            Sell 50%
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                // Desktop: Table Layout
                <div className="px-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-sm text-gray-400 border-b border-white/10">
                        <th className="text-left py-3 px-2">Token</th>
                        <th className="text-right py-3 px-2">Amount</th>
                        <th className="text-right py-3 px-2">Entry</th>
                        <th className="text-right py-3 px-2">Current</th>
                        <th className="text-right py-3 px-2">Value</th>
                        <th className="text-right py-3 px-2">P&L</th>
                        <th className="text-right py-3 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activePositions.map((position) => {
                        const pnl = formatPnL(position)
                        const currentValue =
                          position.totalAmount * position.currentPrice

                        return (
                          <tr
                            key={position.mint}
                            className="border-b border-white/5 hover:bg-white/5 transition-all"
                          >
                            <td className="py-4 px-2">
                              <div className="flex items-center gap-3">
                                {position.image && (
                                  <img
                                    src={position.image}
                                    alt={position.symbol}
                                    className="w-10 h-10 rounded-full"
                                  />
                                )}
                                <div>
                                  <div className="font-semibold">
                                    {position.symbol}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {position.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-right py-4 px-2 font-medium">
                              {formatAmount(position.totalAmount)}
                            </td>
                            <td className="text-right py-4 px-2 text-gray-400">
                              {formatPrice(position.averageBuyPrice)}
                            </td>
                            <td className="text-right py-4 px-2">
                              {formatPrice(position.currentPrice)}
                            </td>
                            <td className="text-right py-4 px-2 font-semibold">
                              {formatValue(currentValue)}
                            </td>
                            <td
                              className={`text-right py-4 px-2 font-medium ${
                                pnl.isPositive
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }`}
                            >
                              <div className="flex items-center justify-end gap-1">
                                {pnl.isPositive ? (
                                  <TrendingUp size={14} />
                                ) : (
                                  <TrendingDown size={14} />
                                )}
                                <span>{pnl.value}</span>
                              </div>
                            </td>
                            <td className="text-right py-4 px-2">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() =>
                                    handleSell(position, position.totalAmount)
                                  }
                                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-xs font-medium text-red-400 transition-all"
                                >
                                  Sell All
                                </button>
                                <button
                                  onClick={() =>
                                    handleSell(
                                      position,
                                      position.totalAmount / 2
                                    )
                                  }
                                  className="px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 rounded-lg text-xs font-medium text-orange-400 transition-all"
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
      </DialogContent>
    </Dialog>
  )
}
