'use client'

import { useIsMobile } from '@/utils/use-is-mobile'
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
  const { isMobile } = useIsMobile()
  const tradersPerSlide = isMobile ? 2 : 3

  const [currentIndex, setCurrentIndex] = useState(tradersPerSlide) // Start after the duplicated items
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Create extended array with duplicates for smooth wrapping
  const extendedTraders = [
    ...mockTraders.slice(-tradersPerSlide), // Last items at the beginning
    ...mockTraders,
    ...mockTraders.slice(0, tradersPerSlide), // First items at the end
  ]

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (!isAutoScrolling || isTransitioning) return

    const interval = setInterval(() => {
      handleNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [currentIndex, isAutoScrolling, isTransitioning])

  // Handle transition end to reset position for infinite effect
  useEffect(() => {
    if (!isTransitioning) return

    const timer = setTimeout(() => {
      setIsTransitioning(false)

      // Reset to real position if we're at duplicates
      if (currentIndex >= mockTraders.length + tradersPerSlide) {
        setCurrentIndex(tradersPerSlide)
      } else if (currentIndex < tradersPerSlide) {
        setCurrentIndex(mockTraders.length)
      }
    }, 500) // Match transition duration

    return () => clearTimeout(timer)
  }, [currentIndex, isTransitioning])

  const handlePrevious = () => {
    setIsAutoScrolling(false)
    setIsTransitioning(true)
    setCurrentIndex((prev) => prev - 1)
  }

  const handleNext = () => {
    setIsTransitioning(true)
    setCurrentIndex((prev) => prev + 1)
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

  const getRankBorder = (rank: number) => {
    switch (rank) {
      case 1:
        return 'border border-white/20 relative overflow-hidden shimmer-gold bg-gradient-to-br from-black/60 to-black/40'
      case 2:
        return 'border border-white/20 relative overflow-hidden shimmer-silver bg-gradient-to-br from-black/60 to-black/40'
      case 3:
        return 'border border-white/20 relative overflow-hidden shimmer-bronze bg-gradient-to-br from-black/60 to-black/40'
      default:
        return 'border border-white/10 hover:border-white/20 bg-black/40'
    }
  }

  const carouselStyle = {
    transform: `translateX(-${(currentIndex * 100) / tradersPerSlide}%)`,
    transition: isTransitioning
      ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
      : 'none',
  }

  return (
    <>
      <style jsx>{`
        @keyframes shimmer-gold {
          0% {
            transform: translateX(-100%) rotate(25deg);
          }
          100% {
            transform: translateX(300%) rotate(25deg);
          }
        }
        @keyframes shimmer-silver {
          0% {
            transform: translateX(-100%) rotate(25deg);
          }
          100% {
            transform: translateX(300%) rotate(25deg);
          }
        }
        @keyframes shimmer-bronze {
          0% {
            transform: translateX(-100%) rotate(25deg);
          }
          100% {
            transform: translateX(300%) rotate(25deg);
          }
        }

        .shimmer-gold::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 60%;
          height: 200%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(250, 204, 21, 0.8),
            rgba(255, 223, 0, 0.6),
            rgba(250, 204, 21, 0.8),
            transparent
          );
          animation: shimmer-gold 4s infinite;
          z-index: 1;
        }

        .shimmer-silver::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 60%;
          height: 200%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(203, 213, 225, 0.9),
            rgba(241, 245, 249, 0.7),
            rgba(203, 213, 225, 0.9),
            transparent
          );
          animation: shimmer-silver 4.5s infinite;
          z-index: 1;
        }

        .shimmer-bronze::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 60%;
          height: 200%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(251, 146, 60, 0.8),
            rgba(255, 165, 0, 0.6),
            rgba(251, 146, 60, 0.8),
            transparent
          );
          animation: shimmer-bronze 5s infinite;
          z-index: 1;
        }
      `}</style>
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
                TRENCH WARRIORS
              </h2>
            </div>

            {/* Elegant Navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevious}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center group"
                onMouseEnter={() => setIsAutoScrolling(false)}
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4 group-hover:text-purple-300 transition-colors" />
              </button>
              <button
                onClick={handleNext}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center group"
                onMouseEnter={() => setIsAutoScrolling(false)}
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4 group-hover:text-purple-300 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden" ref={scrollRef}>
          <div
            className={`flex transition-transform duration-500 ease-in-out`}
            style={carouselStyle}
          >
            {extendedTraders.map((trader, index) => (
              <div
                key={`${trader.rank}-${index}`}
                className={`flex-shrink-0 ${
                  isMobile ? 'w-1/2' : 'w-1/3'
                } px-1.5`}
              >
                <div
                  className={`rounded-lg p-3 transition-all cursor-pointer h-full ${getRankBorder(
                    trader.rank
                  )}`}
                >
                  {/* Rank Badge */}
                  <div className="flex items-center justify-between mb-2 relative z-10">
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
                  <div className="mb-3 relative z-10">
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
                  <div className="grid grid-cols-2 gap-2 text-xs relative z-10">
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
                  <button className="w-full mt-3 py-1.5 px-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 relative z-10">
                    <Zap className="w-3 h-3" />
                    Copy Trades
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-1 mt-3">
          {Array.from({
            length: Math.ceil(mockTraders.length / tradersPerSlide),
          }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                Math.floor(
                  (currentIndex - tradersPerSlide) / tradersPerSlide
                ) === i
                  ? 'bg-purple-400 w-4'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  )
}
