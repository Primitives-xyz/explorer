'use client'

import { useIsMobile } from '@/utils/use-is-mobile'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Trader {
  rank: number
  address: string
  pnl: number
  pnlPercentage: number
  winRate: number
  totalTrades: number
  avgTradeSize: number
  bestTrade: {
    token: string
    profit: number
  }
}

// Mock data for top traders
const mockTraders: Trader[] = [
  {
    rank: 1,
    address: '8xKj9...3mPq',
    pnl: 127543.89,
    pnlPercentage: 2847.3,
    winRate: 89.2,
    totalTrades: 342,
    avgTradeSize: 5.2,
    bestTrade: { token: 'BONK', profit: 45230.12 },
  },
  {
    rank: 2,
    address: '4nBc7...9kLm',
    pnl: 98234.56,
    pnlPercentage: 1923.7,
    winRate: 76.5,
    totalTrades: 289,
    avgTradeSize: 3.8,
    bestTrade: { token: 'WIF', profit: 32156.78 },
  },
  {
    rank: 3,
    address: '7pQr2...5xNv',
    pnl: 76890.23,
    pnlPercentage: 1567.2,
    winRate: 82.1,
    totalTrades: 256,
    avgTradeSize: 4.5,
    bestTrade: { token: 'POPCAT', profit: 28934.45 },
  },
  {
    rank: 4,
    address: '2mTy8...6wRs',
    pnl: 65432.1,
    pnlPercentage: 1234.5,
    winRate: 71.8,
    totalTrades: 198,
    avgTradeSize: 6.2,
    bestTrade: { token: 'MYRO', profit: 21567.89 },
  },
  {
    rank: 5,
    address: '9kLp4...3xQw',
    pnl: 54321.98,
    pnlPercentage: 987.6,
    winRate: 68.9,
    totalTrades: 167,
    avgTradeSize: 7.1,
    bestTrade: { token: 'BOME', profit: 18765.43 },
  },
  {
    rank: 6,
    address: '5vNm3...8yTr',
    pnl: 43210.87,
    pnlPercentage: 765.4,
    winRate: 74.2,
    totalTrades: 145,
    avgTradeSize: 4.9,
    bestTrade: { token: 'SLERF', profit: 15432.21 },
  },
  {
    rank: 7,
    address: '3wXs6...2qPn',
    pnl: 32109.76,
    pnlPercentage: 543.2,
    winRate: 69.7,
    totalTrades: 123,
    avgTradeSize: 5.5,
    bestTrade: { token: 'BRETT', profit: 12098.76 },
  },
  {
    rank: 8,
    address: '6yBn9...4rKm',
    pnl: 21098.65,
    pnlPercentage: 321.1,
    winRate: 66.3,
    totalTrades: 98,
    avgTradeSize: 3.2,
    bestTrade: { token: 'PEPE', profit: 8765.43 },
  },
  {
    rank: 9,
    address: '1qAz7...9oLp',
    pnl: 19876.54,
    pnlPercentage: 298.7,
    winRate: 72.5,
    totalTrades: 87,
    avgTradeSize: 2.8,
    bestTrade: { token: 'FLOKI', profit: 7654.32 },
  },
  {
    rank: 10,
    address: '8uTr5...3wQx',
    pnl: 15432.21,
    pnlPercentage: 234.5,
    winRate: 64.8,
    totalTrades: 76,
    avgTradeSize: 3.5,
    bestTrade: { token: 'SHIB', profit: 5432.1 },
  },
]

interface TrenchesLeaderboardProps {
  currency: 'SOL' | 'USD'
  solPrice: number | null
}

export function TrenchesLeaderboard({
  currency,
  solPrice,
}: TrenchesLeaderboardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const { isMobile } = useIsMobile()
  const tradersPerSlide = isMobile ? 2 : 3

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (!isAutoScrolling) return

    const interval = setInterval(() => {
      handleNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [currentIndex, isAutoScrolling])

  const handlePrevious = () => {
    setIsAutoScrolling(false)
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, mockTraders.length - tradersPerSlide) : prev - 1
    )
  }

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev >= mockTraders.length - tradersPerSlide ? 0 : prev + 1
    )
  }

  const formatValue = (valueInSol: number) => {
    if (currency === 'USD' && solPrice) {
      const valueInUsd = valueInSol * solPrice
      return `$${valueInUsd.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}`
    }
    return `${valueInSol.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })} SOL`
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-black'
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-black'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            TRENCH LEADERBOARD
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onMouseEnter={() => setIsAutoScrolling(false)}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onMouseEnter={() => setIsAutoScrolling(false)}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Traders Grid */}
      <div className="relative overflow-hidden" ref={scrollRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}
          >
            {mockTraders
              .slice(currentIndex, currentIndex + tradersPerSlide)
              .map((trader) => (
                <div
                  key={trader.rank}
                  className="bg-black/40 rounded-lg p-3 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                >
                  {/* Rank Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`${getRankStyle(
                        trader.rank
                      )} px-2 py-1 rounded-full text-xs font-bold`}
                    >
                      #{trader.rank}
                    </div>
                    <div className="text-xs text-gray-400">
                      {trader.address}
                    </div>
                  </div>

                  {/* PNL */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Total PNL</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-sm font-bold text-green-400">
                          +{trader.pnlPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-lg font-bold">
                      {formatValue(trader.pnl)}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/5 rounded p-1.5">
                      <div className="text-gray-400">Win Rate</div>
                      <div className="font-semibold">{trader.winRate}%</div>
                    </div>
                    <div className="bg-white/5 rounded p-1.5">
                      <div className="text-gray-400">Trades</div>
                      <div className="font-semibold">{trader.totalTrades}</div>
                    </div>
                    <div className="bg-white/5 rounded p-1.5 col-span-2">
                      <div className="text-gray-400">Best Trade</div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          {trader.bestTrade.token}
                        </span>
                        <span className="text-green-400">
                          +{formatValue(trader.bestTrade.profit)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full mt-3 py-1.5 px-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3" />
                    Copy Trades
                  </button>
                </div>
              ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-1 mt-3">
        {Array.from({
          length: Math.ceil(mockTraders.length / tradersPerSlide),
        }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              Math.floor(currentIndex / tradersPerSlide) === i
                ? 'bg-purple-400 w-4'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
