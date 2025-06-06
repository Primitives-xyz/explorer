import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import styles from './token-bonded-bar.module.css'

interface TokenBuySellBarProps {
  totalBuy: number
  totalSell: number
  decimals: number
  showLabels?: boolean
}

export function TokenBuySellBar({
  totalBuy,
  totalSell,
  decimals,
  showLabels = true,
}: TokenBuySellBarProps) {
  const total = totalBuy + totalSell
  const buyPercent = total > 0 ? (totalBuy / total) * 100 : 50
  const sellPercent = total > 0 ? (totalSell / total) * 100 : 50

  // Track if this is the first render
  const [hasRendered, setHasRendered] = useState(false)

  useEffect(() => {
    setHasRendered(true)
  }, [])

  return (
    <div className="space-y-2">
      <div className="relative w-full h-6 rounded-lg overflow-hidden flex flex-row border border-gray-700 bg-gray-900">
        <motion.div
          initial={hasRendered ? undefined : { width: `${buyPercent}%` }}
          animate={{ width: `${buyPercent}%` }}
          transition={
            hasRendered ? { duration: 0.5, ease: 'easeOut' } : { duration: 0 }
          }
          className={`h-full relative ${styles['token-buy-bar-gradient']}`}
        >
          {showLabels && buyPercent > 20 && (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white drop-shadow-md">
              {buyPercent.toFixed(0)}%
            </span>
          )}
        </motion.div>
        <motion.div
          initial={hasRendered ? undefined : { width: `${sellPercent}%` }}
          animate={{ width: `${sellPercent}%` }}
          transition={
            hasRendered
              ? { duration: 0.5, ease: 'easeOut', delay: 0.1 }
              : { duration: 0 }
          }
          className={`h-full relative ${styles['token-sell-bar-gradient']}`}
        >
          {showLabels && sellPercent > 20 && (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white drop-shadow-md">
              {sellPercent.toFixed(0)}%
            </span>
          )}
        </motion.div>
      </div>

      {/* Percentage labels if not shown in bar */}
      {showLabels && (buyPercent <= 20 || sellPercent <= 20) && (
        <div className="flex justify-between text-xs">
          <span className="text-green-400 font-medium">
            Buy {buyPercent.toFixed(1)}%
          </span>
          <span className="text-red-400 font-medium">
            Sell {sellPercent.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  )
}
