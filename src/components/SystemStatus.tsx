import { useEffect, useState, memo } from 'react'

const INITIAL_STATS = {
  tps: 4521,
  slot: 246792156,
  blockTime: 0.4,
  nodeCount: 1756,
  totalStake: 372516843,
}

// Memoized stat display to prevent unnecessary re-renders
const StatDisplay = memo(
  ({
    label,
    value,
    format,
  }: {
    label: string
    value: number
    format?: (val: number) => string
  }) => (
    <div className="flex items-center gap-2">
      <span className="text-green-600">{label}:</span>
      <span className="text-green-400">
        {format ? format(value) : value.toLocaleString()}
      </span>
    </div>
  ),
)

StatDisplay.displayName = 'StatDisplay'

export const SystemStatus = () => {
  const [stats, setStats] = useState(INITIAL_STATS)

  // Simulate live updates with reduced frequency and smaller variations
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        tps: prev.tps + Math.floor(Math.random() * 6 - 3), // Smaller TPS changes
        slot: prev.slot + 1, // More predictable slot increment
        blockTime: Number(
          (prev.blockTime + (Math.random() * 0.01 - 0.005)).toFixed(2),
        ), // Smaller block time variations
        nodeCount:
          prev.nodeCount +
          (Math.random() > 0.9 ? Math.floor(Math.random() * 2 - 1) : 0), // Less frequent node count changes
        totalStake:
          prev.totalStake +
          (Math.random() > 0.7 ? Math.floor(Math.random() * 50 - 25) : 0), // Less frequent stake changes
      }))
    }, 5000) // Reduced update frequency to 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="sticky bottom-0 border-t border-green-800 bg-black/90 backdrop-blur-sm py-1 px-2">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-mono">
          <StatDisplay label="TPS" value={stats.tps} />
          <StatDisplay label="SLOT" value={stats.slot} />
          <StatDisplay
            label="BLOCK_TIME"
            value={stats.blockTime}
            format={(val) => `${val}s`}
          />
          <StatDisplay label="NODES" value={stats.nodeCount} />
          <StatDisplay
            label="TOTAL_STAKE"
            value={stats.totalStake}
            format={(val) => `${val.toLocaleString()} SOL`}
          />
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 opacity-75"></div>
        </div>
      </div>
    </footer>
  )
}
