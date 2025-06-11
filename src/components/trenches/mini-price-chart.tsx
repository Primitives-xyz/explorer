'use client'

import { cn } from '@/utils/utils'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MintAggregate } from './trenches-types'

interface MiniPriceChartProps {
  token: MintAggregate
  className?: string
  height?: number
  currency?: 'SOL' | 'USD'
  solPrice?: number | null
}

interface PricePoint {
  timestamp: number
  price: number
  isTradePoint: boolean
}

export function MiniPriceChart({
  token,
  className,
  height = 180,
  currency = 'SOL',
  solPrice,
}: MiniPriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([])
  const [animationTick, setAnimationTick] = useState(0) // Force redraws
  const lastTradeSignatureRef = useRef<string | null>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const backgroundOffsetRef = useRef<number>(0)

  // Chart settings
  const PIXELS_PER_SECOND = 30 // How many pixels = 1 second of time
  const GRID_SPACING = 50 // pixels between grid lines
  const CHART_RIGHT_EDGE = 50 // Keep price line this many pixels from right edge

  // Convert SOL price to display currency
  const convertPrice = useCallback(
    (priceInSol: number) => {
      return currency === 'USD' && solPrice ? priceInSol * solPrice : priceInSol
    },
    [currency, solPrice]
  )

  // Calculate price from trade event data - same logic as live trades
  const calculateTradePrice = (tradeEvent: any): number => {
    const solAmount = Number(tradeEvent.solAmount) / LAMPORTS_PER_SOL
    const tokenAmount =
      Number(tradeEvent.tokenAmount) / Math.pow(10, token.decimals || 9)

    if (tokenAmount === 0) return 0
    return solAmount / tokenAmount
  }

  // Initialize current price
  useEffect(() => {
    if (
      token.pricePerToken &&
      typeof token.pricePerToken === 'number' &&
      currentPrice === 0
    ) {
      setCurrentPrice(convertPrice(token.pricePerToken))
    }
  }, [token.pricePerToken, convertPrice, currentPrice])

  // Detect new trades - same logic as live trades section
  useEffect(() => {
    if (!token.lastTrade?.signature) return

    // Check if this is a new trade
    if (token.lastTrade.signature === lastTradeSignatureRef.current) return

    const tradeEvent = token.lastTrade.eventData?.tradeEvents?.[0]
    if (!tradeEvent) {
      // Still update the ref even if no trade event data to stay in sync
      lastTradeSignatureRef.current = token.lastTrade.signature
      return
    }

    // Calculate price from actual trade data
    const priceInSol = calculateTradePrice(tradeEvent)
    if (priceInSol <= 0) {
      // Still update the ref even if price calculation fails
      lastTradeSignatureRef.current = token.lastTrade.signature
      return
    }

    const newPrice = convertPrice(priceInSol)

    // Update current price (this will cause a jump up/down)
    setCurrentPrice(newPrice)

    // Add trade point to history
    const now = Date.now()
    setPriceHistory((prev) => {
      const newPoint: PricePoint = {
        timestamp: now,
        price: newPrice,
        isTradePoint: true,
      }

      // Keep only recent points (last 2 minutes worth)
      const cutoff = now - 120000
      const filtered = prev.filter((p) => p.timestamp > cutoff)

      return [...filtered, newPoint].slice(-100) // Max 100 points
    })

    lastTradeSignatureRef.current = token.lastTrade.signature
  }, [token, convertPrice])

  // Continuous background scrolling and price tracking
  useEffect(() => {
    if (!currentPrice) return

    const animate = () => {
      const now = Date.now()
      const deltaTime = now - lastUpdateTimeRef.current
      lastUpdateTimeRef.current = now

      // Update background offset based on time
      backgroundOffsetRef.current += (deltaTime / 1000) * PIXELS_PER_SECOND

      // Add price tracking point every 1000ms (every second to match time counter)
      if (deltaTime > 1000) {
        setPriceHistory((prev) => {
          const newPoint: PricePoint = {
            timestamp: now,
            price: currentPrice,
            isTradePoint: false,
          }

          // Keep only recent points (last 2 minutes worth)
          const cutoff = now - 120000
          const filtered = prev.filter((p) => p.timestamp > cutoff)

          return [...filtered, newPoint].slice(-100)
        })
      }

      // Force chart redraw for smooth movement
      setAnimationTick((prev) => (prev + 1) % 1000) // Cycle to prevent overflow

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [currentPrice])

  // Draw the chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !currentPrice) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    // Set canvas size for retina displays
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Current time position (flows from right to left)
    const now = Date.now()
    const currentTimeX = width - CHART_RIGHT_EDGE

    // Calculate price range for Y scaling
    const padding = 20
    const allPrices = priceHistory.map((p) => p.price)
    if (allPrices.length === 0) allPrices.push(currentPrice)

    const minPrice = Math.min(...allPrices, currentPrice)
    const maxPrice = Math.max(...allPrices, currentPrice)
    const priceRange = maxPrice - minPrice || currentPrice * 0.1 // 10% range if no variation

    // Add some padding to price range
    const pricePadding = priceRange * 0.1
    const adjustedMin = minPrice - pricePadding
    const adjustedMax = maxPrice + pricePadding
    const adjustedRange = adjustedMax - adjustedMin

    // Helper to convert price to Y position
    const getY = (price: number) => {
      return (
        padding +
        ((adjustedMax - price) / adjustedRange) * (height - 2 * padding)
      )
    }

    // Draw animated background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1

    // Vertical grid lines (scrolling left)
    const gridOffset = backgroundOffsetRef.current % GRID_SPACING
    for (let x = -gridOffset; x < width + GRID_SPACING; x += GRID_SPACING) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Horizontal grid lines (static)
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw price history trail
    if (priceHistory.length > 1) {
      const now = Date.now()

      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 2
      ctx.beginPath()

      let hasMovedTo = false
      priceHistory.forEach((point, index) => {
        // Calculate X position based on time difference from now
        const timeDiff = now - point.timestamp
        const x = currentTimeX - (timeDiff / 1000) * PIXELS_PER_SECOND

        // Only draw points that are still visible
        if (x >= -50 && x <= width) {
          const y = getY(point.price)

          if (!hasMovedTo) {
            ctx.moveTo(x, y)
            hasMovedTo = true
          } else {
            ctx.lineTo(x, y)
          }
        }
      })

      // Draw the trail
      ctx.stroke()

      // Draw trade points as dots
      priceHistory.forEach((point) => {
        if (point.isTradePoint) {
          const timeDiff = now - point.timestamp
          const x = currentTimeX - (timeDiff / 1000) * PIXELS_PER_SECOND

          if (x >= -10 && x <= width) {
            const y = getY(point.price)

            ctx.beginPath()
            ctx.arc(x, y, 4, 0, 2 * Math.PI)
            ctx.fillStyle = '#22c55e'
            ctx.fill()
            ctx.strokeStyle = '#ffffff'
            ctx.lineWidth = 2
            ctx.stroke()
          }
        }
      })
    }

    // Draw current price line (fixed position)
    const currentY = getY(currentPrice)

    // Animated dotted price line extending across the chart
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 2

    // Animate dash pattern to show time flow
    const dashOffset = (Date.now() / 50) % 10 // Animate every 50ms
    ctx.setLineDash([5, 5])
    ctx.lineDashOffset = -dashOffset // Make dashes flow left

    ctx.beginPath()
    ctx.moveTo(0, currentY)
    ctx.lineTo(width, currentY)
    ctx.stroke()
    ctx.setLineDash([]) // Reset dash
    ctx.lineDashOffset = 0 // Reset offset

    // Current price indicator (pulsing dot)
    const pulseRadius = 6 + Math.sin(Date.now() / 300) * 2
    ctx.beginPath()
    ctx.arc(currentTimeX, currentY, pulseRadius, 0, 2 * Math.PI)
    ctx.fillStyle = '#22c55e'
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.stroke()

    // Price indicator line
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(currentTimeX, currentY)
    ctx.lineTo(width, currentY)
    ctx.stroke()
  }, [currentPrice, priceHistory, animationTick])

  // Format price for display
  const formatPrice = (price: number) => {
    if (currency === 'USD') {
      return price < 0.01
        ? `$${price.toFixed(6)}`
        : price < 1
        ? `$${price.toFixed(4)}`
        : `$${price.toFixed(2)}`
    } else {
      return price < 0.00001
        ? `${price.toFixed(8)} SOL`
        : price < 0.001
        ? `${price.toFixed(6)} SOL`
        : `${price.toFixed(4)} SOL`
    }
  }

  // Calculate price change from first to current
  const tradePoints = priceHistory.filter((p) => p.isTradePoint)
  const firstPrice =
    tradePoints.length > 0 ? tradePoints[0].price : currentPrice
  const priceChange = currentPrice - firstPrice
  const priceChangePercent =
    firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0

  if (!currentPrice) {
    return (
      <div
        className={cn(
          'w-full bg-black/20 rounded-lg flex items-center justify-center text-white/40 text-sm',
          className
        )}
        style={{ height: `${height}px` }}
      >
        No price data available
      </div>
    )
  }

  return (
    <div
      className={cn(
        'w-full rounded-lg bg-black/20 border border-white/10 relative overflow-hidden',
        className
      )}
      style={{ height: `${height}px` }}
    >
      {/* Live Price Header */}
      <div className="absolute top-2 left-3 z-10">
        <div className="text-white font-semibold text-sm">
          {formatPrice(currentPrice)}
        </div>
        {tradePoints.length > 0 && (
          <div
            className={`text-xs ${
              priceChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {priceChange >= 0 ? '+' : ''}
            {priceChangePercent.toFixed(2)}%
          </div>
        )}
      </div>

      {/* Live indicator with pulse animation */}
      <div className="absolute top-2 right-3 z-10 flex items-center gap-1">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-[10px] text-white/60">LIVE</span>
      </div>

      {/* Chart Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          width: '100%',
          height: '100%',
        }}
      />

      {/* Time indicator */}
      <div className="absolute bottom-2 left-3 text-[10px] text-white/40">
        {new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </div>

      {/* Trade count */}
      <div className="absolute bottom-2 right-3 text-[10px] text-white/40">
        {tradePoints.length} trades
      </div>

      {/* CSS for smooth price jump animations */}
      <style jsx>{`
        @keyframes priceJump {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        .price-update {
          animation: priceJump 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
