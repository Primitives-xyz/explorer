'use client'

import { TokenRow } from '@/components/trenches/trenches-components'
import { useIsMobile } from '@/utils/use-is-mobile'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { ChevronLeft, ChevronRight, Flame, Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import { MintAggregate } from './trenches-types'

interface TrenchesHotZoneProps {
  cookingToken: MintAggregate | null
  topRunnerUps: MintAggregate[]
  currency: 'SOL' | 'USD'
  solPrice: number | null
  onTokenClick: (token: MintAggregate) => void
  onDirectBuy: (mint: string, amount: number) => void
}

// Tooltip component
function Tooltip({
  children,
  content,
}: {
  children: React.ReactNode
  content: string
}) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-black/90 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap border border-white/20 shadow-lg">
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export function TrenchesHotZone({
  cookingToken,
  topRunnerUps,
  currency,
  solPrice,
  onTokenClick,
  onDirectBuy,
}: TrenchesHotZoneProps) {
  const { isMobile } = useIsMobile()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)

  // All tokens for mobile carousel
  const allTokens = cookingToken
    ? [cookingToken, ...topRunnerUps]
    : topRunnerUps

  // Auto-scroll for mobile every 4 seconds
  useEffect(() => {
    if (!isMobile || !isAutoScrolling || allTokens.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allTokens.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isMobile, isAutoScrolling, allTokens.length])

  const handlePrevious = () => {
    setIsAutoScrolling(false)
    setCurrentIndex((prev) => (prev - 1 + allTokens.length) % allTokens.length)
  }

  const handleNext = () => {
    setIsAutoScrolling(false)
    setCurrentIndex((prev) => (prev + 1) % allTokens.length)
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="absolute top-2 left-2 z-30">
            <div className="relative">
              <div className="bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 text-black font-black text-xs px-2 py-1 rounded-full shadow-lg border border-yellow-300/50 animate-pulse">
                #1 🔥
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-sm opacity-40 -z-10"></div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="absolute top-2 left-2 z-30">
            <div className="relative">
              <div className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-black font-bold text-xs px-2 py-1 rounded-full shadow-lg border border-yellow-200/50">
                #2 ⚡
              </div>
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-sm opacity-30 -z-10"></div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="absolute top-2 left-2 z-30">
            <div className="bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 text-black font-bold text-xs px-2 py-1 rounded-full shadow-lg border border-orange-200/50">
              #3 🚀
            </div>
          </div>
        )
      default:
        return (
          <div className="absolute top-2 left-2 z-30">
            <div className="bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600 text-white font-bold text-xs px-2 py-1 rounded-full shadow-lg border border-slate-300/50">
              #{rank} 💫
            </div>
          </div>
        )
    }
  }

  if (!cookingToken && topRunnerUps.length === 0) {
    return (
      <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-sm rounded-lg p-4 border border-orange-500/30">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-orange-400 animate-pulse flex-shrink-0" />
          <h2 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent whitespace-nowrap">
            HOT ZONE
          </h2>
          <Tooltip content="These are tokens which have the highest TPS">
            <Info className="w-4 h-4 text-orange-400/70 hover:text-orange-400 transition-colors" />
          </Tooltip>
          <Flame className="w-5 h-5 text-orange-400 animate-pulse flex-shrink-0" />
        </div>
        <div className="text-center text-gray-400 py-8">
          🔥 Waiting for hot tokens to emerge...
        </div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-sm rounded-lg p-4 border border-orange-500/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400 animate-pulse flex-shrink-0" />
            <h2 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent whitespace-nowrap">
              HOT ZONE
            </h2>
            <Tooltip content="These are tokens which have the highest TPS">
              <Info className="w-4 h-4 text-orange-400/70 hover:text-orange-400 transition-colors" />
            </Tooltip>
            <Flame className="w-5 h-5 text-orange-400 animate-pulse flex-shrink-0" />
          </div>

          {/* Mobile Navigation */}
          {allTokens.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevious}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center group"
                onTouchStart={() => setIsAutoScrolling(false)}
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4 group-hover:text-orange-300 transition-colors" />
              </button>
              <button
                onClick={handleNext}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center group"
                onTouchStart={() => setIsAutoScrolling(false)}
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4 group-hover:text-orange-300 transition-colors" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Carousel */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {allTokens.map((token, index) => (
              <div key={token.mint} className="w-full flex-shrink-0 px-1">
                <div className="relative">
                  {getRankBadge(index + 1)}
                  <TokenRow
                    agg={token}
                    onClick={() => onTokenClick(token)}
                    onBuy={onDirectBuy}
                    createdAt={(token as any).tokenCreatedAt}
                    volume={
                      ((token as any).volumePerToken || 0) / LAMPORTS_PER_SOL
                    }
                    currency={currency}
                    solPrice={solPrice}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Progress Dots */}
        {allTokens.length > 1 && (
          <div className="flex items-center justify-center gap-1 mt-3">
            {allTokens.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  currentIndex === i ? 'bg-orange-400 w-4' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-sm rounded-lg p-4 border border-orange-500/30">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-400 animate-pulse flex-shrink-0" />
        <h2 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent whitespace-nowrap">
          HOT ZONE
        </h2>
        <Tooltip content="These are tokens which have the highest TPS">
          <Info className="w-4 h-4 text-orange-400/70 hover:text-orange-400 transition-colors" />
        </Tooltip>
        <Flame className="w-5 h-5 text-orange-400 animate-pulse flex-shrink-0" />
      </div>

      {/* Desktop Grid */}
      <div className="space-y-3">
        {/* First Row: #1 (2 cols) and #2 (1 col) */}
        <div className="grid grid-cols-3 gap-3">
          {/* #1 Token - Takes 2 columns */}
          {cookingToken && (
            <div className="col-span-2 relative">
              {getRankBadge(1)}
              <div className="transform hover:scale-[1.02] transition-transform duration-200">
                <TokenRow
                  agg={cookingToken}
                  onClick={() => onTokenClick(cookingToken)}
                  onBuy={onDirectBuy}
                  createdAt={(cookingToken as any).tokenCreatedAt}
                  volume={
                    ((cookingToken as any).volumePerToken || 0) /
                    LAMPORTS_PER_SOL
                  }
                  currency={currency}
                  solPrice={solPrice}
                />
              </div>
            </div>
          )}

          {/* #2 Token - Takes 1 column */}
          {topRunnerUps[0] && (
            <div className="relative">
              {getRankBadge(2)}
              <div className="transform hover:scale-[1.02] transition-transform duration-200">
                <TokenRow
                  agg={topRunnerUps[0]}
                  onClick={() => onTokenClick(topRunnerUps[0])}
                  onBuy={onDirectBuy}
                  createdAt={(topRunnerUps[0] as any).tokenCreatedAt}
                  volume={
                    ((topRunnerUps[0] as any).volumePerToken || 0) /
                    LAMPORTS_PER_SOL
                  }
                  currency={currency}
                  solPrice={solPrice}
                />
              </div>
            </div>
          )}
        </div>

        {/* Second Row: #3, #4, #5 */}
        {topRunnerUps.slice(1, 4).length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {topRunnerUps.slice(1, 4).map((agg, index) => (
              <div key={agg.mint} className="relative">
                {getRankBadge(index + 3)}
                <div className="transform hover:scale-[1.02] transition-transform duration-200">
                  <TokenRow
                    agg={agg}
                    onClick={() => onTokenClick(agg)}
                    onBuy={onDirectBuy}
                    createdAt={(agg as any).tokenCreatedAt}
                    volume={
                      ((agg as any).volumePerToken || 0) / LAMPORTS_PER_SOL
                    }
                    currency={currency}
                    solPrice={solPrice}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
