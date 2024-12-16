import { useEffect, useState } from 'react'

const INITIAL_STATS = {
  tps: 4521,
  slot: 246792156,
  blockTime: 0.4,
  nodeCount: 1756,
  totalStake: 372516843,
}

export const SystemStatus = () => {
  const [stats, setStats] = useState(INITIAL_STATS)

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        tps: prev.tps + Math.floor(Math.random() * 10 - 5),
        slot: prev.slot + Math.floor(Math.random() * 3 + 1),
        blockTime: Number(
          (prev.blockTime + (Math.random() * 0.02 - 0.01)).toFixed(2),
        ),
        nodeCount:
          prev.nodeCount +
          (Math.random() > 0.7 ? Math.floor(Math.random() * 3 - 1) : 0),
        totalStake: prev.totalStake + Math.floor(Math.random() * 100 - 50),
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="sticky bottom-0 border-t border-green-800 bg-black/90 backdrop-blur-sm py-1 px-2">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-green-600">TPS:</span>
            <span className="text-green-400">{stats.tps}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">SLOT:</span>
            <span className="text-green-400">
              {stats.slot.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">BLOCK_TIME:</span>
            <span className="text-green-400">{stats.blockTime}s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">NODES:</span>
            <span className="text-green-400">
              {stats.nodeCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">TOTAL_STAKE:</span>
            <span className="text-green-400">
              {stats.totalStake.toLocaleString()} SOL
            </span>
          </div>
          <div className="animate-pulse text-green-500">●</div>
        </div>
      </div>
    </footer>
  )
}
