import { motion } from 'framer-motion'
import styles from './token-bonded-bar.module.css'

interface TokenBondedBarProps {
  realSolReserves?: string | number
  LAMPORTS_PER_SOL: number
  showMilestones?: boolean
  bondingProgress?: number
}

export function TokenBondedBar({
  realSolReserves,
  LAMPORTS_PER_SOL,
  showMilestones = true,
  bondingProgress,
}: TokenBondedBarProps) {
  // If bondingProgress is provided directly (as percentage), use it
  // Otherwise calculate from realSolReserves
  let percent: number
  let solAmount: number | null = null

  if (bondingProgress !== undefined) {
    percent = bondingProgress * 100 // Convert 0.16 to 16%
  } else if (realSolReserves) {
    const real = Number(realSolReserves)
    const target = 74 * LAMPORTS_PER_SOL // Pump.fun graduation at 74 SOL
    percent = target > 0 ? Math.min((real / target) * 100, 100) : 0
    solAmount = real / LAMPORTS_PER_SOL
  } else {
    return (
      <div className="w-full h-8 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center text-xs text-gray-500">
        No data
      </div>
    )
  }

  // Milestones for visual feedback
  const milestones = [25, 50, 75, 100]

  return (
    <div className="space-y-2">
      <div className="w-full h-8 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 relative">
        {/* Milestone markers */}
        {showMilestones &&
          milestones.map((milestone) => (
            <div
              key={milestone}
              className="absolute top-0 bottom-0 w-px bg-gray-600 opacity-50"
              style={{ left: `${milestone}%` }}
            />
          ))}

        {/* Progress bar */}
        <motion.div
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full relative ${styles['token-bonded-bar-gradient']}`}
        >
          {/* Glow effect at the end */}
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-white/40 to-transparent" />
        </motion.div>

        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-xs font-bold drop-shadow-lg transition-colors"
            style={{ color: percent > 50 ? '#000' : '#fff' }}
          >
            {percent.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Progress indicators */}
      {solAmount !== null && (
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{solAmount.toFixed(2)} SOL</span>
          <span className="text-gray-500">→</span>
          <span
            className={percent >= 100 ? 'text-green-400 font-semibold' : ''}
          >
            74 SOL {percent >= 100 && '✓'}
          </span>
        </div>
      )}
    </div>
  )
}
