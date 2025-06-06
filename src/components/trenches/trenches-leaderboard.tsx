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
  pnl: number | string
  pnlPercentage: number | string
  winRate: number | string
  totalTrades: number | string
  avgTradeSize: number | string
  bestTrade: {
    token: string
    profit: number | string
  }
  isPlaceholder?: boolean
}

// Placeholder data for upcoming leaderboard
const placeholderTraders: Trader[] = [
  {
    rank: 1,
    address: 'Your Address Here?',
    pnl: 'Calculating...',
    pnlPercentage: '∞',
    winRate: 'TBD',
    totalTrades: 'Coming Soon',
    avgTradeSize: '---',
    bestTrade: { token: 'LEGEND', profit: 'Epic' },
    isPlaceholder: true,
  },
  {
    rank: 2,
    address: 'Top Trencher #2',
    pnl: 'Being Tracked...',
    pnlPercentage: '???',
    winRate: 'TBD',
    totalTrades: 'Coming Soon',
    avgTradeSize: '---',
    bestTrade: { token: 'BEAST', profit: 'Massive' },
    isPlaceholder: true,
  },
  {
    rank: 3,
    address: 'Elite Trader #3',
    pnl: 'Processing...',
    pnlPercentage: '???',
    winRate: 'TBD',
    totalTrades: 'Coming Soon',
    avgTradeSize: '---',
    bestTrade: { token: 'MOON', profit: 'Huge' },
    isPlaceholder: true,
  },
  {
    rank: 4,
    address: 'Could Be You?',
    pnl: 'Analyzing...',
    pnlPercentage: '???',
    winRate: 'TBD',
    totalTrades: 'Coming Soon',
    avgTradeSize: '---',
    bestTrade: { token: 'DEGEN', profit: 'Big' },
    isPlaceholder: true,
  },
  {
    rank: 5,
    address: 'Future Whale',
    pnl: 'Loading...',
    pnlPercentage: '???',
    winRate: 'TBD',
    totalTrades: 'Coming Soon',
    avgTradeSize: '---',
    bestTrade: { token: 'PUMP', profit: 'Nice' },
    isPlaceholder: true,
  },
  {
    rank: 6,
    address: 'Trench Master',
    pnl: 'Compiling...',
    pnlPercentage: '???',
    winRate: 'TBD',
    totalTrades: 'Coming Soon',
    avgTradeSize: '---',
    bestTrade: { token: 'ALPHA', profit: 'Sweet' },
    isPlaceholder: true,
  },
  {
    rank: 7,
    address: 'Degen Royalty',
    pnl: 'Scanning...',
    pnlPercentage: '???',
    winRate: 'TBD',
    totalTrades: 'Coming Soon',
    avgTradeSize: '---',
    bestTrade: { token: 'GEMS', profit: 'Solid' },
    isPlaceholder: true,
  },
  {
    rank: 8,
    address: 'Your Spot?',
    pnl: 'Pending...',
    pnlPercentage: '???',
    winRate: 'TBD',
    totalTrades: 'Coming Soon',
    avgTradeSize: '---',
    bestTrade: { token: 'REKT', profit: 'Good' },
    isPlaceholder: true,
  },
  {
    rank: 9,
    address: 'Future Legend',
    pnl: 'Calculating...',
    pnlPercentage: '???',
    winRate: 'TBD',
    totalTrades: 'Coming Soon',
    avgTradeSize: '---',
    bestTrade: { token: 'BAGS', profit: 'Nice' },
    isPlaceholder: true,
  },
  {
    rank: 10,
    address: 'Claim This Spot',
    pnl: 'Available...',
    pnlPercentage: '???',
    winRate: 'TBD',
    totalTrades: 'Coming Soon',
    avgTradeSize: '---',
    bestTrade: { token: 'MOON', profit: 'Soon' },
    isPlaceholder: true,
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
    ...placeholderTraders.slice(-tradersPerSlide), // Last items at the beginning
    ...placeholderTraders,
    ...placeholderTraders.slice(0, tradersPerSlide), // First items at the end
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
      if (currentIndex >= placeholderTraders.length + tradersPerSlide) {
        setCurrentIndex(tradersPerSlide)
      } else if (currentIndex < tradersPerSlide) {
        setCurrentIndex(placeholderTraders.length)
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

  const formatValue = (value: number | string) => {
    if (typeof value === 'string') {
      return value
    }

    if (currency === 'USD' && solPrice) {
      const valueInUsd = value * solPrice
      return `$${valueInUsd.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}`
    }
    return `${value.toLocaleString(undefined, {
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
        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
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

        .pulse-glow {
          animation: pulse-glow 2s infinite;
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
              <div className="bg-purple-600/20 px-2 py-0.5 rounded-full text-xs text-purple-300 border border-purple-500/30 pulse-glow">
                Coming Soon
              </div>
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
                  )} group hover:scale-105`}
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
                    <div className="text-xs text-gray-400 italic">
                      {trader.address}
                    </div>
                  </div>

                  {/* PNL */}
                  <div className="mb-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Total PNL</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-purple-400 pulse-glow" />
                        <span className="text-sm font-bold text-purple-400">
                          {typeof trader.pnlPercentage === 'string'
                            ? trader.pnlPercentage
                            : `+${trader.pnlPercentage.toFixed(1)}%`}
                        </span>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-300">
                      {formatValue(trader.pnl)}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs relative z-10">
                    <div className="bg-white/5 rounded p-1.5">
                      <div className="text-gray-400">Win Rate</div>
                      <div className="font-semibold text-gray-300">
                        {trader.winRate}
                        {typeof trader.winRate === 'number' ? '%' : ''}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded p-1.5">
                      <div className="text-gray-400">Trades</div>
                      <div className="font-semibold text-gray-300">
                        {trader.totalTrades}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded p-1.5 col-span-2">
                      <div className="text-gray-400">Best Trade</div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-purple-300">
                          {trader.bestTrade.token}
                        </span>
                        <span className="text-purple-400">
                          {typeof trader.bestTrade.profit === 'string'
                            ? trader.bestTrade.profit
                            : `+${formatValue(trader.bestTrade.profit)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full mt-3 py-1.5 px-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 relative z-10 group-hover:border-purple-400/70">
                    <Zap className="w-3 h-3 pulse-glow" />
                    {trader.rank <= 3 ? 'Reserve Spot' : 'Claim Position'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-1 mt-3">
          {Array.from({
            length: Math.ceil(placeholderTraders.length / tradersPerSlide),
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

        {/* Teaser Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400 italic">
            🔥 Leaderboard tracking begins soon. Start trading to secure your
            legendary status! Only trades opened and closed on SSE will be
            eligible for PnL 🔥
          </p>
        </div>
      </div>
    </>
  )
}
