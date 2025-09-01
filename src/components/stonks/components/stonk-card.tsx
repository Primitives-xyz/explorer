'use client'

import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { Graph } from '@/components/trade/trade-content/graph'
import {
  Badge,
  Button,
  ButtonVariant,
  Card,
  CardVariant,
} from '@/components/ui'
import { USDC_MINT } from '@/utils/constants'
import { cn, formatCurrency } from '@/utils/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { IStockInfo } from '../stonks.models'
import { StockChart } from './stock-chart'

interface Props {
  stock: IStockInfo
  isExpanded: boolean
  onClick: () => void
  precomputedUsdPrice?: number | null
  precomputedChange24h?: number | null
}

export function StonkCard({
  stock,
  isExpanded,
  onClick,
  precomputedUsdPrice,
  precomputedChange24h,
}: Props) {
  const { setOpen, setInputs } = useSwapStore()
  const [priceHistory, setPriceHistory] = useState<number[]>([])

  // Prefer fetched price for xStock tokens; avoid falling back to hardcoded if no liquidity
  const currentPrice = stock.symbol === 'USDC' ? 1 : precomputedUsdPrice ?? 0

  const hasValidPrice = typeof currentPrice === 'number' && currentPrice > 0
  const noLiquidity = stock.symbol !== 'USDC' && !hasValidPrice
  const priceLoading = false

  // Simulate price history for chart (in production, fetch from API)
  useEffect(() => {
    if (currentPrice > 0) {
      setPriceHistory((prev) => {
        const newHistory = [...prev.slice(-19), currentPrice]
        return newHistory
      })
    }
  }, [currentPrice])

  // Use v3 priceChange24h only; if unavailable, don't show a value
  const hasChange =
    precomputedChange24h !== null && precomputedChange24h !== undefined
  const change24h = hasChange ? precomputedChange24h : null
  const isPositive = change24h !== null ? change24h >= 0 : false

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation()
    setInputs({
      inputMint: USDC_MINT,
      outputMint: stock.mint,
      inputAmount: currentPrice, // 1 stock worth of USDC
    })
    setOpen(true)
  }

  const handleSell = (e: React.MouseEvent) => {
    e.stopPropagation()
    setInputs({
      inputMint: stock.mint,
      outputMint: USDC_MINT,
      inputAmount: 1, // 1 stock
    })
    setOpen(true)
  }

  return (
    <motion.div
      initial={false}
      animate={{ scale: isExpanded ? 1.02 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        variant={CardVariant.DEFAULT}
        className={cn(
          'cursor-pointer transition-all duration-200',
          'hover:bg-accent/5',
          isExpanded && 'ring-2 ring-primary/50'
        )}
        onClick={onClick}
      >
        <div className="p-3 md:p-4">
          {/* Main Row */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Symbol & Name */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-bold truncate">
                {stock.symbol}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {stock.name}
              </p>
              {!!stock.mint && (
                <div className="mt-1">
                  <SolanaAddressDisplay
                    address={stock.mint}
                    showCopyButton={true}
                    displayAbbreviatedAddress
                    className="text-[10px] md:text-xs text-muted-foreground"
                  />
                </div>
              )}
            </div>

            {/* Middle: Price & Change */}
            <div className="flex flex-col items-center md:items-end">
              <div className="flex items-center gap-2">
                <p className="text-sm md:text-lg font-semibold">
                  {priceLoading && !hasValidPrice ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : noLiquidity ? (
                    <span className="text-muted-foreground">N/A</span>
                  ) : (
                    formatCurrency(currentPrice)
                  )}
                </p>
                {noLiquidity && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-1">
                    No liquidity
                  </Badge>
                )}
              </div>
              {!noLiquidity && hasChange && change24h !== null && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs md:text-sm',
                    isPositive ? 'text-green-500' : 'text-red-500'
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {change24h.toFixed(2)}%
                  </span>
                </div>
              )}
              {!noLiquidity && !hasChange && (
                <div className="text-[10px] md:text-xs text-muted-foreground">
                  —
                </div>
              )}
            </div>

            {/* Right: Mini Chart & Buy Button */}
            <div className="flex items-center gap-2 md:gap-4">
              {!noLiquidity && (
                <div className="hidden sm:block w-16 md:w-20 h-8 md:h-10">
                  <StockChart
                    data={priceHistory}
                    isPositive={isPositive}
                    mini
                  />
                </div>
              )}
              <Button
                variant={ButtonVariant.DEFAULT}
                size="sm"
                onClick={handleBuy}
                disabled={priceLoading || noLiquidity}
                className="text-xs md:text-sm px-3 md:px-4 min-w-[60px] md:min-w-[80px]"
              >
                Buy
              </Button>
            </div>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 md:pt-6 mt-4 border-t border-border/50">
                  {!!stock.mint && (
                    <div className="mb-4">
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">
                        Contract
                      </p>
                      <SolanaAddressDisplay address={stock.mint} />
                    </div>
                  )}
                  {/* Full Chart (Birdeye) */}
                  {!!stock.mint && (
                    <div className="mb-4 md:mb-6">
                      <Graph id={stock.mint} />
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 mb-4 md:mb-6">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Market Cap
                      </p>
                      <p className="text-sm md:text-base font-semibold">
                        {formatCurrency(
                          stock.marketCap || currentPrice * 1000000
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        24h Volume
                      </p>
                      <p className="text-sm md:text-base font-semibold">
                        {formatCurrency(
                          stock.volume24h || currentPrice * 50000
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        24h High
                      </p>
                      <p className="text-sm md:text-base font-semibold">
                        {formatCurrency(currentPrice * 1.05)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        24h Low
                      </p>
                      <p className="text-sm md:text-base font-semibold">
                        {formatCurrency(currentPrice * 0.95)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 md:gap-3">
                    <Button
                      variant={ButtonVariant.DEFAULT}
                      onClick={handleBuy}
                      disabled={priceLoading || noLiquidity}
                      className="flex-1 text-sm md:text-base"
                    >
                      Buy {stock.symbol}
                    </Button>
                    <Button
                      variant={ButtonVariant.SECONDARY}
                      onClick={handleSell}
                      disabled={priceLoading || noLiquidity}
                      className="flex-1 text-sm md:text-base"
                    >
                      Sell {stock.symbol}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  )
}
