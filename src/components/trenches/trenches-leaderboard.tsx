'use client'

import { useGetProfiles } from '@/components/tapestry/hooks/use-get-profiles'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { Avatar } from '@/components/ui/avatar/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMobile } from '@/utils/use-is-mobile'
import { abbreviateWalletAddress } from '@/utils/utils'
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
  username?: string
  imageUrl?: string | null
  isPlaceholder?: boolean
}

interface TrenchesLeaderboardProps {
  currency: 'SOL' | 'USD'
  solPrice: number | null
}

function TraderCard({
  trader,
  currency,
  solPrice,
  getRankStyle,
  getRankBorder,
  formatValue,
}: {
  trader: Trader
  currency: 'SOL' | 'USD'
  solPrice: number | null
  getRankStyle: (rank: number) => string
  getRankBorder: (rank: number) => string
  formatValue: (value: number | string) => string
}) {
  // Always call hooks at the top
  const { profiles } = useGetProfiles({ walletAddress: trader.address })
  const profile = profiles?.profiles?.[0]
  const username =
    profile?.profile?.username ||
    abbreviateWalletAddress({ address: trader.address })
  const imageUrl = profile?.profile?.image

  const { symbol, image } = useTokenInfo(trader.bestTrade.token)

  const router = useRouter()

  // Only render the real trader UI
  const handleClick = () => {
    if (profile?.profile?.username) {
      router.push(`/${profile.profile.username}`)
    } else {
      router.push(`/${trader.address}`)
    }
  }

  return (
    <div
      className={`rounded-lg p-3 transition-all cursor-pointer h-full ${getRankBorder(
        trader.rank
      )} group hover:scale-105`}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick()
      }}
    >
      {/* Rank Badge + Username (column) */}
      <div className="flex flex-col items-start mb-2 relative z-10 gap-1">
        <div
          className={`${getRankStyle(
            trader.rank
          )} px-2 py-1 rounded-full text-xs font-bold w-fit`}
        >
          #{trader.rank}
        </div>
        <div className="flex items-center gap-2">
          <Avatar username={username} imageUrl={imageUrl} size={32} />
          <span className="text-xs text-gray-400 italic">{username}</span>
        </div>
      </div>
      {/* PNL */}
      <div className="mb-3 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Total PNL</span>
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
            {typeof trader.winRate === 'number'
              ? `${trader.winRate.toFixed(1)}%`
              : trader.winRate}
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
            <span className="font-semibold text-purple-300 flex items-center gap-1">
              {image && (
                <img
                  src={image}
                  alt={symbol}
                  className="w-4 h-4 rounded-full"
                />
              )}{' '}
              {symbol ||
                abbreviateWalletAddress({ address: trader.bestTrade.token })}
            </span>
            <span className="text-purple-400">
              {typeof trader.bestTrade.profit === 'number'
                ? `+$${trader.bestTrade.profit.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}`
                : trader.bestTrade.profit}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TrenchesLeaderboard({
  currency,
  solPrice,
}: TrenchesLeaderboardProps) {
  const { isMobile } = useIsMobile()
  const tradersPerSlide = isMobile ? 1 : 3

  const [currentIndex, setCurrentIndex] = useState(tradersPerSlide) // Start after the duplicated items
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // --- Leaderboard data integration ---
  const [traders, setTraders] = useState<Trader[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to get the start of the current week (last Sunday at 00:00:00 UTC)
  const getWeekStart = (): number => {
    const now = new Date()
    const dayOfWeek = now.getUTCDay() // 0 = Sunday, 1 = Monday, etc.
    const daysToSubtract = dayOfWeek

    const weekStart = new Date(now)
    weekStart.setUTCDate(now.getUTCDate() - daysToSubtract)
    weekStart.setUTCHours(0, 0, 0, 0) // Set to start of day

    return weekStart.getTime()
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    // Calculate weekly time range
    const since = getWeekStart()
    const params = new URLSearchParams({
      since: since.toString(),
    })

    console.log(
      `Fetching weekly leaderboard since: ${new Date(since).toISOString()}`
    )

    fetch(`/api/pnl-leaderboard?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch leaderboard')
        return res.json()
      })
      .then(async (data) => {
        if (cancelled) return
        const leaderboard = data.leaderboard as Array<{
          walletAddress: string
          realizedPnLUSD: number
          tradeCount: number
          winRate: number
          bestTrade: { token: string; profit: number }
        }>
        // Map to Trader interface and fetch profile info for each
        const mapped: Trader[] = await Promise.all(
          leaderboard.map(async (entry, i) => {
            return {
              rank: i + 1,
              address: entry.walletAddress,
              pnl: entry.realizedPnLUSD,
              pnlPercentage: '',
              winRate: entry.winRate,
              totalTrades: entry.tradeCount,
              avgTradeSize: '---',
              bestTrade: {
                token: entry.bestTrade.token,
                profit: entry.bestTrade.profit,
              },
            }
          })
        )
        setTraders(mapped)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError('Failed to load leaderboard')
        setTraders([])
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Create extended array with duplicates for smooth wrapping
  const extendedTraders = [
    ...traders.slice(-tradersPerSlide), // Last items at the beginning
    ...traders,
    ...traders.slice(0, tradersPerSlide), // First items at the end
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
      if (currentIndex >= traders.length + tradersPerSlide) {
        setCurrentIndex(tradersPerSlide)
      } else if (currentIndex < tradersPerSlide) {
        setCurrentIndex(traders.length)
      }
    }, 500) // Match transition duration

    return () => clearTimeout(timer)
  }, [currentIndex, isTransitioning, traders.length, tradersPerSlide])

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

    if (currency === 'USD') {
      // Value is already in USD from the API
      return `$${value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}`
    } else {
      // Convert USD to SOL for display
      if (solPrice && solPrice > 0) {
        const valueInSol = value / solPrice
        return `${valueInSol.toLocaleString(undefined, {
          maximumFractionDigits: 4,
        })} SOL`
      } else {
        return `${value.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })} USD`
      }
    }
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
          <div
            className={`flex items-center ${
              isMobile ? 'flex-col' : 'justify-between'
            }`}
          >
            {/* Title */}
            <div className="flex items-center gap-2 flex-wrap">
              <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div className="flex flex-col">
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
                  WEEKLY SSE PROFIT LEADERBOARD
                </h2>
                <p className="text-xs text-gray-400 leading-tight">
                  Top performers this week (resets every Sunday)
                </p>
              </div>
              <div className="bg-purple-600/20 px-2 py-0.5 rounded-full text-xs text-purple-300 border border-purple-500/30 pulse-glow">
                Tracking Live
              </div>
            </div>

            {/* Elegant Navigation */}
            <div
              className={`flex items-center gap-1 ${isMobile ? 'mt-2' : ''}`}
            >
              <button
                onClick={handlePrevious}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center group flex-shrink-0"
                onMouseEnter={() => setIsAutoScrolling(false)}
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4 group-hover:text-purple-300 transition-colors" />
              </button>
              <button
                onClick={handleNext}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center group flex-shrink-0"
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
            {loading
              ? Array.from({ length: tradersPerSlide * 2 }).map((_, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 ${
                      isMobile ? 'w-full' : 'w-1/3'
                    } px-1.5`}
                  >
                    <Skeleton className="w-full h-[220px] rounded-lg bg-neutral-800" />
                  </div>
                ))
              : extendedTraders.map((trader, index) => (
                  <div
                    key={`${trader.rank}-${index}`}
                    className={`flex-shrink-0 ${
                      isMobile ? 'w-full' : 'w-1/3'
                    } px-1.5`}
                  >
                    <TraderCard
                      trader={trader}
                      currency={currency}
                      solPrice={solPrice}
                      getRankStyle={getRankStyle}
                      getRankBorder={getRankBorder}
                      formatValue={formatValue}
                    />
                  </div>
                ))}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-1 mt-3">
          {Array.from({
            length: Math.ceil(traders.length / tradersPerSlide),
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
            🔥 Weekly rankings reset every Sunday! Most profitable traders this
            week earn their spots on the leaderboard. Only positions opened AND
            closed through SSE count toward your ranking 🔥
          </p>
        </div>
      </div>
    </>
  )
}
