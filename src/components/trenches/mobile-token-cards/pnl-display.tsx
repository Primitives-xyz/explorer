'use client'

import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface PnLDisplayProps {
  totalPnL: number
  tradeCount: number
  formatPnL: (amount: number) => string
}

export function PnLDisplay({
  totalPnL,
  tradeCount,
  formatPnL,
}: PnLDisplayProps) {
  if (tradeCount === 0) return null

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`px-4 py-2 rounded-full backdrop-blur font-bold flex items-center gap-2 ${
        totalPnL >= 0
          ? 'bg-green-500/20 text-green-400'
          : 'bg-red-500/20 text-red-400'
      }`}
    >
      {totalPnL >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
      {totalPnL >= 0 ? '+' : ''}
      {formatPnL(totalPnL)}
      <span className="text-xs opacity-70">({tradeCount} trades)</span>
    </motion.div>
  )
}
