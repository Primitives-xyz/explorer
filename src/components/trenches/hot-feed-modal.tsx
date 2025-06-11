'use client'

import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { SOL_MINT } from '@/utils/constants'
import { formatPriceWithCurrency } from '@/utils/format-price'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  ShoppingCart,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { PnLDisplay } from './mobile-token-cards/pnl-display'

import { MiniPriceChart } from './mini-price-chart'
import { TokenBadges } from './token-badges'
import { TokenBondedBar } from './token-bonded-bar'
import { TokenBuySellBar } from './token-buy-sell-bar'
import { MintAggregate } from './trenches-types'

interface HotFeedModalProps {
  isOpen: boolean
  onClose: () => void
  tokens: MintAggregate[]
  currency: 'SOL' | 'USD'
  solPrice: number | null
  onShowDetails: (token: MintAggregate) => void
  initialIndex?: number
  initialToken?: MintAggregate | null
}

interface UserPosition {
  mint: string
  buyPrice: number
  currentPrice: number
  amount: number
  timestamp: number
}

interface TradeActivity {
  id: string
  type: 'buy' | 'sell'
  user: string
  timestamp: number
  amount?: number
  price?: number
}

const INITIAL_LOAD = 6
const LOAD_MORE_THRESHOLD = 3
const LOAD_MORE_COUNT = 3

// Memoized trade activity component
const TradeActivityItem = memo(
  ({ trade, index }: { trade: TradeActivity; index: number }) => (
    <div
      key={trade.id}
      className={`absolute flex items-center gap-2 text-xs px-3 py-1.5 rounded-full backdrop-blur transition-all duration-500 ${
        trade.type === 'buy'
          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
          : 'bg-red-500/20 text-red-400 border border-red-500/30'
      }`}
      style={{
        top: `${index * 28}px`,
        left: 0,
        right: 0,
        animation: `fadeInScale 0.3s ease-out`,
      }}
    >
      {trade.type === 'buy' ? (
        <ShoppingCart size={12} />
      ) : (
        <TrendingUp size={12} />
      )}
      <span className="font-medium">{trade.user}</span>
      <span>{trade.type === 'buy' ? 'bought' : 'sold'}</span>
    </div>
  )
)

TradeActivityItem.displayName = 'TradeActivityItem'

// Memoized trade item component
const TradeItem = memo(
  ({
    trade,
    tokenSymbol,
    formatTradeValue,
  }: {
    trade: TradeActivity
    tokenSymbol: string
    formatTradeValue: (amount: number, price: number) => string
  }) => (
    <div
      className={`p-3 rounded-lg border transition-all ${
        trade.type === 'buy'
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-red-500/10 border-red-500/30'
      }`}
      style={{
        animation: 'fadeInScale 0.3s ease-out',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {trade.type === 'buy' ? (
            <ShoppingCart size={14} className="text-green-400" />
          ) : (
            <TrendingUp size={14} className="text-red-400" />
          )}
          <span
            className={`text-sm font-medium ${
              trade.type === 'buy' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {trade.user}
          </span>
        </div>
        <span className="text-xs text-white/60">
          {Math.floor((Date.now() - trade.timestamp) / 1000)}s ago
        </span>
      </div>
      <div className="mt-1 text-xs text-white/80">
        {trade.type === 'buy' ? 'Bought' : 'Sold'}{' '}
        {trade.amount?.toLocaleString()} {tokenSymbol} for{' '}
        {formatTradeValue(trade.amount || 0, trade.price || 0)}
      </div>
    </div>
  )
)

TradeItem.displayName = 'TradeItem'

export function HotFeedModal({
  isOpen,
  onClose,
  tokens,
  currency,
  solPrice,
  onShowDetails,
  initialIndex = 0,
  initialToken,
}: HotFeedModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userPositions, setUserPositions] = useState<UserPosition[]>([])
  const { setOpen, setInputs } = useSwapStore()
  const [showPnL, setShowPnL] = useState(false)
  // Inventory store removed - using local state only
  const [recentTrades, setRecentTrades] = useState<
    Record<string, TradeActivity[]>
  >({})
  const [bondingProgress, setBondingProgress] = useState<
    Record<string, number>
  >({})
  const prevTokensRef = useRef<Record<string, MintAggregate>>({})

  // Touch handling state
  const [isDragging, setIsDragging] = useState(false)
  const [dragDirection, setDragDirection] = useState<'x' | 'y' | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const startPosRef = useRef({ x: 0, y: 0 })
  const [swipeDirection, setSwipeDirection] = useState<'up' | 'down' | null>(
    null
  )
  const [isAnimating, setIsAnimating] = useState(false)
  const [viewIndex, setViewIndex] = useState(1) // 0=transactions, 1=main, 2=details
  const [isDesktop, setIsDesktop] = useState(false)

  // Create a stable mint stack that won't reorder
  const [mintStack, setMintStack] = useState<string[]>([])
  const stackInitialized = useRef(false)
  const highestIndexViewed = useRef(0)
  const isNavigatingRef = useRef(false) // Track if we're navigating

  // Memoize sorted tokens to avoid re-sorting on every render
  const sortedTokens = useMemo(() => {
    if (!isOpen || tokens.length === 0) return []

    // If we have an initial token, put it first
    if (initialToken) {
      const otherTokens = tokens.filter((t) => t.mint !== initialToken.mint)
      const sorted = otherTokens.sort((a, b) => (b.tps || 0) - (a.tps || 0))
      return [initialToken, ...sorted]
    }

    return [...tokens].sort((a, b) => (b.tps || 0) - (a.tps || 0))
  }, [tokens, isOpen, initialToken])

  // Reset stack initialization when modal closes
  useEffect(() => {
    if (!isOpen) {
      stackInitialized.current = false
      setCurrentIndex(0)
      setViewIndex(1)
      isNavigatingRef.current = false
    }
  }, [isOpen])

  // Check if desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768) // md breakpoint
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Initialize the mint stack once when component mounts
  useEffect(() => {
    if (!stackInitialized.current && sortedTokens.length > 0 && isOpen) {
      const initialMints = sortedTokens
        .slice(0, INITIAL_LOAD)
        .map((t) => t.mint)
      setMintStack(initialMints)
      stackInitialized.current = true

      // Reset to first token when we have a new initial token
      if (initialToken) {
        setCurrentIndex(0)
      }

      // Initialize bonding progress
      const initialProgress: Record<string, number> = {}
      sortedTokens.slice(0, INITIAL_LOAD).forEach((token) => {
        const progress =
          Number(
            token.lastTrade?.eventData?.tradeEvents?.[0]?.realSolReserves || 0
          ) / LAMPORTS_PER_SOL
        initialProgress[token.mint] = progress
      })
      setBondingProgress(initialProgress)

      // Store initial tokens for comparison
      const tokenMap: Record<string, MintAggregate> = {}
      tokens.forEach((t) => {
        tokenMap[t.mint] = t
      })
      prevTokensRef.current = tokenMap
    }
  }, [sortedTokens, tokens, isOpen, initialToken])

  // Reset when modal opens with a new initial token - but not during navigation
  useEffect(() => {
    if (
      isOpen &&
      initialToken &&
      stackInitialized.current &&
      !isNavigatingRef.current
    ) {
      // Only process if this is actually a different token than what's currently first
      if (mintStack[0] !== initialToken.mint) {
        // Find if the initial token is already in our stack
        const existingIndex = mintStack.findIndex(
          (mint) => mint === initialToken.mint
        )

        if (existingIndex === -1) {
          // Token not in stack, rebuild the stack with this token first
          const otherTokens = tokens.filter((t) => t.mint !== initialToken.mint)
          const sorted = otherTokens.sort((a, b) => (b.tps || 0) - (a.tps || 0))
          const newMintStack = [
            initialToken.mint,
            ...sorted.slice(0, INITIAL_LOAD - 1).map((t) => t.mint),
          ]
          setMintStack(newMintStack)
          setCurrentIndex(0)
        } else if (existingIndex !== 0) {
          // Token is in stack but not first, move it to first
          const newMintStack = [
            initialToken.mint,
            ...mintStack.filter((mint) => mint !== initialToken.mint),
          ]
          setMintStack(newMintStack)
          setCurrentIndex(0)
        }
      }

      // Don't reset viewIndex here - it interferes with navigation
    }
  }, [isOpen, initialToken, tokens, mintStack])

  // Helper to get current live token data
  const getCurrentToken = (index: number): MintAggregate | null => {
    const mint = mintStack[index]
    if (!mint) return null

    // Try to find in current tokens first
    const liveToken = tokens.find((t) => t.mint === mint)
    if (liveToken) return liveToken

    // Fallback: create minimal token object to prevent crashes
    return {
      mint,
      trades: [],
      totalBuy: 0,
      totalSell: 0,
      lastTrade: null,
      tps: 0,
      mintSymbol: 'Loading...',
      mintName: 'Loading...',
      pricePerToken: 0,
    } as MintAggregate
  }

  // Detect trades for visible tokens (no need to update stack since we always lookup fresh data)
  useEffect(() => {
    if (!isOpen || !stackInitialized.current) return

    const currentTokenMap: Record<string, MintAggregate> = {}
    tokens.forEach((t) => {
      currentTokenMap[t.mint] = t
    })

    // Only process trade updates for tokens that are visible or nearby
    const visibleMints = new Set(
      mintStack.slice(Math.max(0, currentIndex - 2), currentIndex + 3)
    )

    // Compare with previous state to detect trades
    Object.entries(currentTokenMap).forEach(([mint, token]) => {
      // Skip processing if token is not visible
      if (!visibleMints.has(mint)) return

      const prevToken = prevTokensRef.current[mint]
      if (!prevToken) return

      // Check if there's a new trade
      if (
        token.lastTrade?.signature !== prevToken.lastTrade?.signature &&
        token.lastTrade
      ) {
        const tradeEvent = token.lastTrade.eventData?.tradeEvents?.[0]
        if (tradeEvent) {
          const newTrade: TradeActivity = {
            id: token.lastTrade.signature || `${Date.now()}-${Math.random()}`,
            type: tradeEvent.isBuy ? 'buy' : 'sell',
            user: tradeEvent.user
              ? `${tradeEvent.user.slice(0, 4)}...${tradeEvent.user.slice(-3)}`
              : 'Unknown',
            timestamp: Date.now(),
            amount:
              Number(tradeEvent.tokenAmount) /
              Math.pow(10, token.decimals || 9),
            price: token.pricePerToken || 0,
          }

          setRecentTrades((prev) => {
            const currentTrades = prev[mint] || []
            // Only add if not already present (by signature)
            const exists = currentTrades.some((t) => t.id === newTrade.id)
            if (!exists) {
              return {
                ...prev,
                [mint]: [newTrade, ...currentTrades].slice(0, 20), // Keep more trades for the feed
              }
            }
            return prev
          })

          // Update bonding progress with real data
          const currentReserves =
            Number(tradeEvent.realSolReserves || 0) / LAMPORTS_PER_SOL
          setBondingProgress((prev) => ({
            ...prev,
            [mint]: currentReserves,
          }))
        }
      }
    })

    prevTokensRef.current = currentTokenMap
  }, [tokens, isOpen, currentIndex, mintStack])

  // Clear old trades periodically - optimized to run less frequently
  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      setRecentTrades((prev) => {
        const updated: Record<string, TradeActivity[]> = {}
        Object.entries(prev).forEach(([mint, trades]) => {
          const validTrades = trades.filter(
            (trade) => Date.now() - trade.timestamp < 60000 // Keep trades for 1 minute in the feed
          )
          if (validTrades.length > 0) {
            updated[mint] = validTrades
          }
        })
        return updated
      })
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [isOpen])

  // Load more tokens when user approaches end of stack
  useEffect(() => {
    if (currentIndex > highestIndexViewed.current) {
      highestIndexViewed.current = currentIndex

      // Check if we need to load more
      const remainingTokens = mintStack.length - currentIndex - 1
      if (remainingTokens <= LOAD_MORE_THRESHOLD) {
        // Get current TPS rankings and find tokens not in our stack
        const sortedTokens = [...tokens].sort(
          (a, b) => (b.tps || 0) - (a.tps || 0)
        )
        const stackMints = new Set(mintStack)
        const newTokens = sortedTokens
          .filter((t) => !stackMints.has(t.mint))
          .slice(0, LOAD_MORE_COUNT)

        if (newTokens.length > 0) {
          setMintStack((prev) => [...prev, ...newTokens.map((t) => t.mint)])

          // Initialize bonding progress for new tokens
          const newProgress: Record<string, number> = {}
          newTokens.forEach((token) => {
            const progress =
              Number(
                token.lastTrade?.eventData?.tradeEvents?.[0]?.realSolReserves ||
                  0
              ) / LAMPORTS_PER_SOL
            newProgress[token.mint] = progress
          })
          setBondingProgress((prev) => ({ ...prev, ...newProgress }))
        }
      }
    }
  }, [currentIndex, mintStack, tokens])

  // Calculate total PnL
  const totalPnL = userPositions.reduce((acc, pos) => {
    const pnlPercent = ((pos.currentPrice - pos.buyPrice) / pos.buyPrice) * 100
    const pnlAmount = (pos.currentPrice - pos.buyPrice) * pos.amount
    return acc + pnlAmount
  }, 0)

  // Reset to initial index when modal opens
  useEffect(() => {
    if (isOpen && initialIndex !== undefined) {
      setCurrentIndex(initialIndex)
      setViewIndex(1) // Reset to main view
    }
  }, [isOpen, initialIndex])

  // Update current prices for user positions
  useEffect(() => {
    setUserPositions((prev) =>
      prev.map((pos) => {
        const token = tokens.find((t) => t.mint === pos.mint)
        if (token && token.pricePerToken) {
          return { ...pos, currentPrice: token.pricePerToken }
        }
        return pos
      })
    )
  }, [tokens])

  // Touch and navigation handlers
  const handleSwipe = (direction: 'up' | 'down') => {
    // Mark that we're navigating
    isNavigatingRef.current = true

    // Don't reset viewIndex here - let the animation complete first
    setSwipeDirection(direction)
    setIsAnimating(true)

    // Let the current card animate out completely
    setTimeout(() => {
      // Change index after animation
      if (direction === 'up' && currentIndex < mintStack.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      } else if (direction === 'down' && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1)
      }

      // Reset states
      setDragOffset({ x: 0, y: 0 })
      setSwipeDirection(null)
      setIsAnimating(false)
      // Don't reset viewIndex at all - let users stay on their current panel

      // Clear navigation flag after a delay
      setTimeout(() => {
        isNavigatingRef.current = false
      }, 100)
    }, 300)
  }

  // Desktop navigation handlers
  const handleDesktopNavigation = (direction: 'up' | 'down') => {
    if (isAnimating) return

    if (direction === 'up' && currentIndex < mintStack.length - 1) {
      handleSwipe('up')
    } else if (direction === 'down' && currentIndex > 0) {
      handleSwipe('down')
    }
  }

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return
    const touch = e.touches[0]
    startPosRef.current = { x: touch.clientX, y: touch.clientY }
    setIsDragging(true)
    setDragDirection(null)
    setDragOffset({ x: 0, y: 0 })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isAnimating) return
    const touch = e.touches[0]
    const deltaX = touch.clientX - startPosRef.current.x
    const deltaY = touch.clientY - startPosRef.current.y

    // Determine drag direction if not set
    if (!dragDirection) {
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        setDragDirection(Math.abs(deltaY) > Math.abs(deltaX) ? 'y' : 'x')
      }
    }

    // Update drag offset based on direction
    if (dragDirection === 'y') {
      // Only allow vertical scrolling on the main view
      if (viewIndex === 1) {
        setDragOffset({ x: 0, y: deltaY })
      }
    } else if (dragDirection === 'x') {
      setDragOffset({ x: deltaX, y: 0 })
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging || isAnimating) return
    setIsDragging(false)

    // Handle swipe based on direction and offset
    if (
      dragDirection === 'y' &&
      Math.abs(dragOffset.y) > 100 &&
      viewIndex === 1
    ) {
      // Only allow vertical swiping on main view
      handleSwipe(dragOffset.y > 0 ? 'down' : 'up')
    } else if (dragDirection === 'x') {
      if (dragOffset.x > 100 && viewIndex > 0) {
        // Swipe right - go to previous view
        setViewIndex(viewIndex - 1)
        setDragOffset({ x: 0, y: 0 })
      } else if (dragOffset.x < -100 && viewIndex < 2) {
        // Swipe left - go to next view
        setViewIndex(viewIndex + 1)
        setDragOffset({ x: 0, y: 0 })
      } else {
        // Snap back
        setDragOffset({ x: 0, y: 0 })
      }
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 })
    }

    setDragDirection(null)
  }

  const handleBuy = (amount: number) => {
    if (!currentToken) return

    // Track the position locally for the TikTok feed
    const newPosition: UserPosition = {
      mint: currentToken.mint,
      buyPrice: currentToken.pricePerToken || 0,
      currentPrice: currentToken.pricePerToken || 0,
      amount: amount,
      timestamp: Date.now(),
    }
    setUserPositions((prev) => [...prev, newPosition])
    setShowPnL(true)

    // Local tracking only - real trades logged by auto-trade-logger

    // Get the setIsNestedModal function from the store
    const { setIsNestedModal } = useSwapStore.getState()

    // Mark that we're opening from a nested modal
    setIsNestedModal(true)

    // Open swap directly - keeping the swipe view open
    setOpen(true)
    setInputs({
      inputMint: SOL_MINT,
      outputMint: currentToken.mint,
      inputAmount: amount,
    })
  }

  // Keyboard navigation for desktop
  useEffect(() => {
    if (!isOpen || !isDesktop) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          if (currentIndex < mintStack.length - 1) {
            handleSwipe('up')
          }
          break
        case 'ArrowDown':
          e.preventDefault()
          if (currentIndex > 0) {
            handleSwipe('down')
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (viewIndex > 0) {
            setViewIndex(viewIndex - 1)
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (viewIndex < 2) {
            setViewIndex(viewIndex + 1)
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isOpen,
    isDesktop,
    currentIndex,
    mintStack.length,
    viewIndex,
    isAnimating,
    onClose,
  ])

  // Mouse wheel navigation for desktop
  useEffect(() => {
    if (!isOpen || !isDesktop) return

    const handleWheel = (e: WheelEvent) => {
      if (isAnimating || viewIndex !== 1) return // Only allow scrolling in main view

      e.preventDefault()

      // Debounce wheel events
      if (Math.abs(e.deltaY) > 50) {
        if (e.deltaY > 0 && currentIndex < mintStack.length - 1) {
          handleSwipe('up')
        } else if (e.deltaY < 0 && currentIndex > 0) {
          handleSwipe('down')
        }
      }
    }

    // Add wheel listener to the window with passive: false to allow preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [
    isOpen,
    isDesktop,
    currentIndex,
    mintStack.length,
    viewIndex,
    isAnimating,
  ])

  // Memoize formatters to avoid recreating on every render
  const formatPrice = useMemo(
    () => (priceInSol: number) => {
      return formatPriceWithCurrency(priceInSol, currency, solPrice)
    },
    [currency, solPrice]
  )

  const formatValue = useMemo(
    () =>
      (valueInSol: number, decimals: number = 2) => {
        if (currency === 'USD' && solPrice) {
          const valueInUsd = valueInSol * solPrice
          if (valueInUsd > 1000000) {
            return `$${(valueInUsd / 1000000).toFixed(2)}M`
          } else if (valueInUsd > 1000) {
            return `$${(valueInUsd / 1000).toFixed(2)}K`
          }
          return `$${valueInUsd.toFixed(decimals)}`
        }
        if (valueInSol > 1000) {
          return `${(valueInSol / 1000).toFixed(2)}K SOL`
        }
        return `${valueInSol.toFixed(decimals)} SOL`
      },
    [currency, solPrice]
  )

  const formatLiquidity = useMemo(
    () => (realSolReservesLamports: number) => {
      // Check if realSolReserves is 0 or very close to 0
      if (realSolReservesLamports === 0) {
        return 'Unknown'
      }
      const solValue = realSolReservesLamports / LAMPORTS_PER_SOL
      return formatValue(solValue, 2)
    },
    [formatValue]
  )

  const formatPnL = useMemo(
    () => (amount: number) => {
      if (currency === 'USD' && solPrice) {
        const usdAmount = amount * solPrice
        return `$${Math.abs(usdAmount).toFixed(2)}`
      }
      return `${Math.abs(amount).toFixed(4)} SOL`
    },
    [currency, solPrice]
  )

  const formatTradeValue = (amount: number, price: number) => {
    const solValue = amount * price
    if (currency === 'USD' && solPrice) {
      const usdValue = solValue * solPrice
      return `$${usdValue.toFixed(2)}`
    }
    return `${solValue.toFixed(4)} SOL`
  }

  const currentToken = getCurrentToken(currentIndex)

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !currentToken) return null

  // Get the horizontal offset for the entire panel group
  const getPanelGroupStyle = () => {
    if (!isDragging && !isAnimating) {
      // Final positions based on viewIndex
      const offset = viewIndex * -100
      return {
        transform: `translateX(${offset}%)`,
        transition: 'transform 0.3s ease-out',
      }
    }

    if (isDragging && dragDirection === 'x') {
      // While dragging horizontally
      const baseOffset = viewIndex * -100
      const dragPercent = (dragOffset.x / window.innerWidth) * 100

      // Clamp the drag to prevent over-scrolling
      let clampedPercent = dragPercent
      // if (viewIndex === 0 && dragPercent > 0) {
      //   // At leftmost view, resist dragging right
      //   clampedPercent = dragPercent * 0.3
      // } else if (viewIndex === 2 && dragPercent < 0) {
      //   // At rightmost view, resist dragging left
      //   clampedPercent = dragPercent * 0.3
      // }

      return {
        transform: `translateX(calc(${baseOffset}% + ${clampedPercent}%))`,
        transition: 'none',
      }
    }

    // Default (including vertical dragging)
    const offset = viewIndex * -100
    return {
      transform: `translateX(${offset}%)`,
      transition: 'transform 0.3s ease-out',
    }
  }

  // Get card style for vertical animations
  const getCardStyle = (cardIndex: number) => {
    const isCurrentCard = cardIndex === currentIndex
    const isPrevCard = cardIndex === currentIndex - 1
    const isNextCard = cardIndex === currentIndex + 1

    if (!isCurrentCard && !isPrevCard && !isNextCard) {
      return { display: 'none' }
    }

    let transform = ''

    // Base vertical positioning
    if (isPrevCard) {
      transform = 'translateY(-100%)'
    } else if (isNextCard) {
      transform = 'translateY(100%)'
    } else {
      transform = 'translateY(0)'
    }

    // Apply vertical drag offset when dragging vertically
    if (isDragging && dragDirection === 'y' && viewIndex === 1) {
      if (isCurrentCard) {
        transform = `translateY(${dragOffset.y}px)`
      } else if (isPrevCard) {
        transform = `translateY(calc(-100% + ${dragOffset.y}px))`
      } else if (isNextCard) {
        transform = `translateY(calc(100% + ${dragOffset.y}px))`
      }
    }

    // Apply animation classes
    if (isAnimating && swipeDirection) {
      if (isCurrentCard && swipeDirection === 'up') {
        transform = 'translateY(-100%)'
      } else if (isCurrentCard && swipeDirection === 'down') {
        transform = 'translateY(100%)'
      } else if (isPrevCard && swipeDirection === 'down') {
        transform = 'translateY(0)'
      } else if (isNextCard && swipeDirection === 'up') {
        transform = 'translateY(0)'
      }
    }

    return {
      transform,
      transition:
        isAnimating || !isDragging ? 'transform 0.3s ease-out' : 'none',
      zIndex: isCurrentCard ? 10 : 5,
    }
  }

  return (
    <>
      {/* Backdrop - Only render when modal is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
        />
      )}

      {/* Feed Container */}
      <div
        className={`fixed inset-0 z-50 flex flex-col transition-all duration-300 ${
          isOpen
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
        onClick={(e) => {
          // Stop propagation to prevent backdrop click
          e.stopPropagation()
        }}
      >
        {/* Header with PnL and Close button */}
        {isOpen && (
          <div className="p-4 relative">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              {/* Close button for desktop only */}
              {isDesktop && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {/* Live PnL Display */}
              <div
                className={isDesktop ? 'ml-auto' : 'w-full flex justify-center'}
              >
                <PnLDisplay
                  totalPnL={totalPnL}
                  tradeCount={userPositions.length}
                  formatPnL={formatPnL}
                />
              </div>
            </div>
          </div>
        )}

        {/* Token Cards */}
        <div className="flex-1 relative overflow-hidden">
          {/* Desktop Navigation Buttons */}
          {isDesktop && (
            <>
              {/* Previous Button */}
              {currentIndex > 0 && (
                <button
                  onClick={() => handleDesktopNavigation('down')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all transform hover:scale-110"
                  disabled={isAnimating}
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* Next Button */}
              {currentIndex < mintStack.length - 1 && (
                <button
                  onClick={() => handleDesktopNavigation('up')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all transform hover:scale-110"
                  disabled={isAnimating}
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </>
          )}

          {/* Token position indicator */}
          {mintStack.length > 1 && (
            <div
              className={`absolute top-4 ${
                isDesktop ? 'left-1/2 -translate-x-1/2' : 'right-4'
              } z-20 px-3 py-1 bg-black/40 rounded-full text-sm text-white/60`}
            >
              {currentIndex + 1} / {mintStack.length}
            </div>
          )}

          {/* Desktop Layout - Show all 3 panels */}
          {isDesktop && isOpen && currentToken && (
            <div className="flex h-full items-center justify-center p-6">
              <div className="flex gap-4 max-w-7xl mx-auto h-full items-center">
                {/* Transactions Panel */}
                <div
                  className={`w-[380px] h-[600px] transition-all duration-300 ${
                    isAnimating && swipeDirection ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  <div className="bg-gradient-to-br from-gray-900/95 to-black/95 rounded-3xl p-6 border border-white/20 shadow-2xl backdrop-blur h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity size={20} />
                        Live Trades
                      </h3>
                    </div>

                    {/* Transaction List */}
                    <div className="overflow-y-auto flex-1 space-y-2">
                      {(recentTrades[currentToken.mint] || []).length === 0 ? (
                        <div className="text-center text-white/40 py-8">
                          No recent trades
                        </div>
                      ) : (
                        recentTrades[currentToken.mint]?.map((trade) => (
                          <TradeItem
                            key={trade.id}
                            trade={trade}
                            tokenSymbol={currentToken.mintSymbol || ''}
                            formatTradeValue={formatTradeValue}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Token Card - Animated */}
                <div className="relative w-[420px] h-[600px] overflow-hidden">
                  {[currentIndex - 1, currentIndex, currentIndex + 1].map(
                    (index) => {
                      if (index < 0 || index >= mintStack.length) return null
                      const token = getCurrentToken(index)
                      if (!token) return null
                      const isCurrentCard = index === currentIndex
                      const isPrevCard = index === currentIndex - 1
                      const isNextCard = index === currentIndex + 1

                      let transform = ''
                      let opacity = 1

                      if (isPrevCard) {
                        transform = 'translateX(-100%) scale(0.9)'
                        opacity = 0
                      } else if (isNextCard) {
                        transform = 'translateX(100%) scale(0.9)'
                        opacity = 0
                      } else {
                        transform = 'translateX(0) scale(1)'
                      }

                      // Apply animation
                      if (isAnimating && swipeDirection) {
                        if (isCurrentCard && swipeDirection === 'up') {
                          transform = 'translateX(-100%) scale(0.9)'
                          opacity = 0
                        } else if (isCurrentCard && swipeDirection === 'down') {
                          transform = 'translateX(100%) scale(0.9)'
                          opacity = 0
                        } else if (isPrevCard && swipeDirection === 'down') {
                          transform = 'translateY(0)'
                        } else if (isNextCard && swipeDirection === 'up') {
                          transform = 'translateY(0)'
                        }
                      }

                      return (
                        <div
                          key={token.mint}
                          className="absolute inset-0 transition-all duration-300"
                          style={{
                            transform,
                            opacity,
                            zIndex: isCurrentCard ? 10 : 5,
                          }}
                        >
                          <div className="bg-gradient-to-br from-purple-900/90 via-pink-900/90 to-orange-900/90 rounded-3xl p-6 border border-white/20 shadow-2xl backdrop-blur h-full flex flex-col">
                            {/* Token Header */}
                            <div className="flex items-start justify-between mb-4 gap-4">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {token.mintImage && (
                                  <img
                                    src={token.mintImage}
                                    alt={token.mintSymbol}
                                    className="w-16 h-16 rounded-full ring-4 ring-white/20 hover:scale-110 transition-transform duration-200 flex-shrink-0"
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <h2 className="text-2xl font-bold text-white truncate">
                                    {token.mintSymbol}
                                  </h2>
                                  <p className="text-sm text-white/70 truncate">
                                    {token.mintName}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-xs text-white/60">
                                  Market Cap
                                </div>
                                <div className="text-xl font-bold text-white">
                                  {formatValue(
                                    (token.pricePerToken || 0) * 1_000_000_000
                                  )}
                                </div>
                                <div className="text-xs text-white/50 mt-1">
                                  {formatPrice(token.pricePerToken || 0)}
                                </div>
                              </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-colors">
                                <div className="text-xs text-white/60 flex items-center gap-1">
                                  <Zap size={10} /> Liquidity
                                </div>
                                <div className="text-sm font-bold text-white">
                                  {formatLiquidity(
                                    Number(
                                      token.lastTrade?.eventData
                                        ?.tradeEvents?.[0]?.realSolReserves || 0
                                    )
                                  )}
                                </div>
                              </div>
                              <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-colors">
                                <div className="text-xs text-white/60 flex items-center gap-1">
                                  <Activity size={10} /> Volume
                                </div>
                                <div className="text-sm font-bold text-white">
                                  {formatValue(
                                    (token.volumePerToken || 0) /
                                      LAMPORTS_PER_SOL
                                  )}
                                </div>
                              </div>
                              <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-colors">
                                <div className="text-xs text-white/60 flex items-center gap-1">
                                  <Flame size={10} /> TPS
                                </div>
                                <div className="text-sm font-bold text-white">
                                  {token.tps?.toFixed(1) || '0'}
                                </div>
                              </div>
                            </div>

                            {/* Mini Chart */}
                            <div className="mb-6">
                              <MiniPriceChart
                                token={token}
                                height={180}
                                className="backdrop-blur border-white/20"
                                currency={currency}
                                solPrice={solPrice}
                              />
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1 mb-4">
                              <TokenBadges agg={token} />
                            </div>

                            {/* Animated Bonding Progress */}
                            <div className="mb-6">
                              <div className="text-xs text-white/60 mb-2 flex items-center justify-between">
                                <span>Bonding Progress</span>
                                <span className="text-white/80 font-medium">
                                  {(
                                    ((bondingProgress[token.mint] || 0) / 74) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                              <div className="relative h-4 bg-black/30 rounded-full overflow-hidden backdrop-blur">
                                <div
                                  className="absolute inset-0 bg-gradient-to-r from-green-400 via-yellow-400 to-orange-400 transition-all duration-500"
                                  style={{
                                    width: `${
                                      ((bondingProgress[token.mint] || 0) /
                                        74) *
                                      100
                                    }%`,
                                  }}
                                />
                                {/* Milestone markers */}
                                {[25, 50, 75].map((milestone) => (
                                  <div
                                    key={milestone}
                                    className="absolute top-0 bottom-0 w-px bg-white/20"
                                    style={{
                                      left: `${(milestone / 74) * 100}%`,
                                    }}
                                  />
                                ))}
                              </div>
                              <div className="flex justify-between text-[10px] text-white/40 mt-1">
                                <span>0 SOL</span>
                                <span>74 SOL</span>
                              </div>
                            </div>

                            {/* Buy Amounts */}
                            <div className="grid grid-cols-3 gap-2 mt-auto">
                              {[0.01, 0.1, 0.5].map((amount) => (
                                <button
                                  key={amount}
                                  onClick={() => handleBuy(amount)}
                                  className="py-3 px-4 bg-gradient-to-r from-green-500/30 to-emerald-500/30 hover:from-green-500/40 hover:to-emerald-500/40 border border-green-400/50 rounded-xl font-bold text-green-300 transition-all backdrop-blur hover:scale-105 active:scale-95"
                                >
                                  Buy {amount} SOL
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    }
                  )}
                </div>

                {/* Details Panel */}
                <div
                  className={`w-[380px] h-[600px] transition-all duration-300 ${
                    isAnimating && swipeDirection ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  <div className="bg-gradient-to-br from-indigo-900/95 to-purple-900/95 rounded-3xl p-6 border border-white/20 shadow-2xl backdrop-blur h-full flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <TrendingUp size={20} />
                        Token Stats
                      </h3>
                    </div>

                    {/* Details Content */}
                    <div className="overflow-y-auto flex-1 space-y-4">
                      {/* Contract Address */}
                      <div className="bg-black/40 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Contract
                          </span>
                          <SolanaAddressDisplay
                            address={currentToken.mint}
                            showCopyButton
                            displayAbbreviatedAddress
                            className="text-sm font-mono"
                            fullAddressOnHover={false}
                          />
                        </div>
                      </div>

                      {/* Market Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
                          <div className="text-xs text-gray-400 mb-1">
                            Market Cap
                          </div>
                          <div className="font-semibold">
                            {formatValue(
                              (currentToken.pricePerToken || 0) * 1_000_000_000
                            )}
                          </div>
                        </div>
                        <div className="bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
                          <div className="text-xs text-gray-400 mb-1">
                            24h Volume
                          </div>
                          <div className="font-semibold">
                            {formatValue(
                              (currentToken.volumePerToken || 0) /
                                LAMPORTS_PER_SOL
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Time Since Launch */}
                      {currentToken.tokenCreatedAt && (
                        <div className="bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
                          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Clock size={12} />
                            Launch Time
                          </div>
                          <div className="font-semibold">
                            {formatTimeSince(
                              Date.now() / 1000 - currentToken.tokenCreatedAt
                            )}
                          </div>
                        </div>
                      )}

                      {/* Trading Activity */}
                      <div className="bg-gradient-to-br from-purple-900/10 to-pink-900/10 backdrop-blur rounded-xl p-4 border border-purple-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-400">
                            Trading Activity
                          </span>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-green-400">
                              {currentToken.trades?.filter((t: any) =>
                                t.eventData?.tradeEvents?.some(
                                  (e: any) => e.isBuy
                                )
                              ).length || 0}{' '}
                              buys
                            </span>
                            <span className="text-gray-500">vs</span>
                            <span className="text-red-400">
                              {currentToken.trades?.filter((t: any) =>
                                t.eventData?.tradeEvents?.some(
                                  (e: any) => !e.isBuy
                                )
                              ).length || 0}{' '}
                              sells
                            </span>
                          </div>
                        </div>
                        <TokenBuySellBar
                          totalBuy={currentToken.totalBuy}
                          totalSell={currentToken.totalSell}
                          decimals={currentToken.decimals ?? 9}
                        />
                      </div>

                      {/* Bonding Progress */}
                      <div className="bg-gradient-to-br from-orange-900/10 to-red-900/10 backdrop-blur rounded-xl p-4 border border-orange-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-400">
                            Bonding Curve Progress
                          </span>
                          <span className="text-xs text-orange-400">
                            {(
                              (currentToken.bondingProgress || 0) * 100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <TokenBondedBar
                          realSolReserves={Number(
                            currentToken.realSolReserves ||
                              currentToken.lastTrade?.eventData
                                ?.tradeEvents?.[0]?.realSolReserves ||
                              0
                          )}
                          LAMPORTS_PER_SOL={LAMPORTS_PER_SOL}
                          bondingProgress={currentToken.bondingProgress}
                        />
                      </div>

                      {/* Top Holders */}
                      {currentToken.topWallets &&
                        currentToken.topWallets.length > 0 && (
                          <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-2 mb-3">
                              <Users size={16} className="text-gray-400" />
                              <span className="text-sm text-gray-400">
                                Top Holders
                              </span>
                            </div>
                            <div className="space-y-2">
                              {currentToken.topWallets
                                .slice(0, 5)
                                .map((wallet, i) => (
                                  <div
                                    key={i}
                                    className="flex justify-between items-center"
                                  >
                                    <SolanaAddressDisplay
                                      address={wallet.wallet}
                                      displayAbbreviatedAddress
                                      showCopyButton={false}
                                      className="text-sm"
                                    />
                                    <div className="text-right">
                                      <div className="text-sm font-medium">
                                        {(
                                          (wallet.totalVolume /
                                            (currentToken.volumePerToken ||
                                              1)) *
                                          100
                                        ).toFixed(2)}
                                        %
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Layout - Keep existing swipeable panels */}
          {!isDesktop &&
            isOpen &&
            [currentIndex - 1, currentIndex, currentIndex + 1].map((index) => {
              if (index < 0 || index >= mintStack.length) return null
              const token = getCurrentToken(index)
              if (!token) return null
              const isCurrentCard = index === currentIndex

              return (
                <div
                  key={token.mint}
                  className={`absolute inset-0 flex flex-col items-center justify-center p-6 touch-none`}
                  style={getCardStyle(index)}
                  onTouchStart={
                    index === currentIndex ? handleTouchStart : undefined
                  }
                  onTouchMove={
                    index === currentIndex ? handleTouchMove : undefined
                  }
                  onTouchEnd={
                    index === currentIndex ? handleTouchEnd : undefined
                  }
                >
                  {/* Main Card Container */}
                  <div className="w-full max-w-sm relative">
                    {/* Main container for all panels */}
                    <div className="relative w-full h-[600px] max-h-[80vh] overflow-hidden">
                      {/* Horizontal panel group */}
                      <div
                        className="absolute inset-0 flex"
                        style={getPanelGroupStyle()}
                      >
                        {/* Transaction Panel (Left) */}
                        <div className="w-full flex-shrink-0">
                          <div className="bg-gradient-to-br from-gray-900/95 to-black/95 rounded-3xl p-6 border border-white/20 shadow-2xl backdrop-blur h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Activity size={20} />
                                Live Trades
                              </h3>
                              <button
                                onClick={() => setViewIndex(1)}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                              >
                                <ChevronRight size={20} />
                              </button>
                            </div>

                            {/* Transaction List */}
                            <div className="overflow-y-auto flex-1 space-y-2">
                              {(recentTrades[token.mint] || []).length === 0 ? (
                                <div className="text-center text-white/40 py-8">
                                  No recent trades
                                </div>
                              ) : (
                                recentTrades[token.mint]?.map((trade) => (
                                  <TradeItem
                                    key={trade.id}
                                    trade={trade}
                                    tokenSymbol={token.mintSymbol || ''}
                                    formatTradeValue={formatTradeValue}
                                  />
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Main Card (Center) */}
                        <div className="w-full flex-shrink-0">
                          <div className="bg-gradient-to-br from-purple-900/90 via-pink-900/90 to-orange-900/90 rounded-3xl p-6 border border-white/20 shadow-2xl backdrop-blur h-full flex flex-col">
                            {/* Token Header */}
                            <div className="flex items-start justify-between mb-4 gap-4">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {token.mintImage && (
                                  <img
                                    src={token.mintImage}
                                    alt={token.mintSymbol}
                                    className="w-16 h-16 rounded-full ring-4 ring-white/20 hover:scale-110 transition-transform duration-200 flex-shrink-0"
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <h2 className="text-2xl font-bold text-white truncate">
                                    {token.mintSymbol}
                                  </h2>
                                  <p className="text-sm text-white/70 truncate">
                                    {token.mintName}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-xs text-white/60">
                                  Market Cap
                                </div>
                                <div className="text-xl font-bold text-white">
                                  {formatValue(
                                    (token.pricePerToken || 0) * 1_000_000_000
                                  )}
                                </div>
                                <div className="text-xs text-white/50 mt-1">
                                  {formatPrice(token.pricePerToken || 0)}
                                </div>
                              </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-colors">
                                <div className="text-xs text-white/60 flex items-center gap-1">
                                  <Zap size={10} /> Liquidity
                                </div>
                                <div className="text-sm font-bold text-white">
                                  {formatLiquidity(
                                    Number(
                                      token.lastTrade?.eventData
                                        ?.tradeEvents?.[0]?.realSolReserves || 0
                                    )
                                  )}
                                </div>
                              </div>
                              <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-colors">
                                <div className="text-xs text-white/60 flex items-center gap-1">
                                  <Activity size={10} /> Volume
                                </div>
                                <div className="text-sm font-bold text-white">
                                  {formatValue(
                                    (token.volumePerToken || 0) /
                                      LAMPORTS_PER_SOL
                                  )}
                                </div>
                              </div>
                              <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-colors">
                                <div className="text-xs text-white/60 flex items-center gap-1">
                                  <Flame size={10} /> TPS
                                </div>
                                <div className="text-sm font-bold text-white">
                                  {token.tps?.toFixed(1) || '0'}
                                </div>
                              </div>
                            </div>

                            {/* Mini Chart */}
                            <div className="mb-6">
                              <MiniPriceChart
                                token={token}
                                height={180}
                                className="backdrop-blur border-white/20"
                                currency={currency}
                                solPrice={solPrice}
                              />
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1 mb-6">
                              <TokenBadges agg={token} />
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between items-center mb-4">
                              <button
                                onClick={() => setViewIndex(0)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                              >
                                <ChevronLeft size={16} />
                                Live Trades
                              </button>
                              <button
                                onClick={() => setViewIndex(2)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                              >
                                Token Stats
                                <ChevronRight size={16} />
                              </button>
                            </div>

                            {/* Buy Amounts */}
                            <div className="grid grid-cols-3 gap-2 mt-auto">
                              {[0.01, 0.1, 0.5].map((amount) => (
                                <button
                                  key={amount}
                                  onClick={() => handleBuy(amount)}
                                  className="py-3 px-4 bg-gradient-to-r from-green-500/30 to-emerald-500/30 hover:from-green-500/40 hover:to-emerald-500/40 border border-green-400/50 rounded-xl font-bold text-green-300 transition-all backdrop-blur hover:scale-105 active:scale-95"
                                >
                                  Buy {amount} SOL
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Details Panel (Right) - Similar to desktop but with back button */}
                        <div className="w-full flex-shrink-0">
                          <div className="bg-gradient-to-br from-indigo-900/95 to-purple-900/95 rounded-3xl p-6 border border-white/20 shadow-2xl backdrop-blur h-full flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                              <button
                                onClick={() => setViewIndex(1)}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                              >
                                <ChevronLeft size={20} />
                              </button>
                              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <TrendingUp size={20} />
                                Token Stats
                              </h3>
                              <div className="w-10" />{' '}
                              {/* Spacer for centering */}
                            </div>

                            {/* Copy the details content from desktop using token instead of currentToken */}
                            <div className="overflow-y-auto flex-1 space-y-4">
                              {/* Contract Address */}
                              <div className="bg-black/40 rounded-lg p-3 border border-white/10">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    Contract
                                  </span>
                                  <SolanaAddressDisplay
                                    address={token.mint}
                                    showCopyButton
                                    displayAbbreviatedAddress
                                    className="text-sm font-mono"
                                    fullAddressOnHover={false}
                                  />
                                </div>
                              </div>

                              {/* Market Stats */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
                                  <div className="text-xs text-gray-400 mb-1">
                                    Market Cap
                                  </div>
                                  <div className="font-semibold">
                                    {formatValue(
                                      (token.pricePerToken || 0) * 1_000_000_000
                                    )}
                                  </div>
                                </div>
                                <div className="bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
                                  <div className="text-xs text-gray-400 mb-1">
                                    24h Volume
                                  </div>
                                  <div className="font-semibold">
                                    {formatValue(
                                      (token.volumePerToken || 0) /
                                        LAMPORTS_PER_SOL
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Time Since Launch */}
                              {token.tokenCreatedAt && (
                                <div className="bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
                                  <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                    <Clock size={12} />
                                    Launch Time
                                  </div>
                                  <div className="font-semibold">
                                    {formatTimeSince(
                                      Date.now() / 1000 - token.tokenCreatedAt
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Trading Activity */}
                              <div className="bg-gradient-to-br from-purple-900/10 to-pink-900/10 backdrop-blur rounded-xl p-4 border border-purple-500/20">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm text-gray-400">
                                    Trading Activity
                                  </span>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="text-green-400">
                                      {token.trades?.filter((t: any) =>
                                        t.eventData?.tradeEvents?.some(
                                          (e: any) => e.isBuy
                                        )
                                      ).length || 0}{' '}
                                      buys
                                    </span>
                                    <span className="text-gray-500">vs</span>
                                    <span className="text-red-400">
                                      {token.trades?.filter((t: any) =>
                                        t.eventData?.tradeEvents?.some(
                                          (e: any) => !e.isBuy
                                        )
                                      ).length || 0}{' '}
                                      sells
                                    </span>
                                  </div>
                                </div>
                                <TokenBuySellBar
                                  totalBuy={token.totalBuy}
                                  totalSell={token.totalSell}
                                  decimals={token.decimals ?? 9}
                                />
                              </div>

                              {/* Bonding Progress */}
                              <div className="bg-gradient-to-br from-orange-900/10 to-red-900/10 backdrop-blur rounded-xl p-4 border border-orange-500/20">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm text-gray-400">
                                    Bonding Curve Progress
                                  </span>
                                  <span className="text-xs text-orange-400">
                                    {(
                                      (token.bondingProgress || 0) * 100
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </div>
                                <TokenBondedBar
                                  realSolReserves={Number(
                                    token.realSolReserves ||
                                      token.lastTrade?.eventData
                                        ?.tradeEvents?.[0]?.realSolReserves ||
                                      0
                                  )}
                                  LAMPORTS_PER_SOL={LAMPORTS_PER_SOL}
                                  bondingProgress={token.bondingProgress}
                                />
                              </div>

                              {/* Top Holders */}
                              {token.topWallets &&
                                token.topWallets.length > 0 && (
                                  <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Users
                                        size={16}
                                        className="text-gray-400"
                                      />
                                      <span className="text-sm text-gray-400">
                                        Top Holders
                                      </span>
                                    </div>
                                    <div className="space-y-2">
                                      {token.topWallets
                                        .slice(0, 5)
                                        .map((wallet, i) => (
                                          <div
                                            key={i}
                                            className="flex justify-between items-center"
                                          >
                                            <SolanaAddressDisplay
                                              address={wallet.wallet}
                                              displayAbbreviatedAddress
                                              showCopyButton={false}
                                              className="text-sm"
                                            />
                                            <div className="text-right">
                                              <div className="text-sm font-medium">
                                                {(
                                                  (wallet.totalVolume /
                                                    (token.volumePerToken ||
                                                      1)) *
                                                  100
                                                ).toFixed(2)}
                                                %
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instructions - Different for mobile/desktop */}
                  {index === currentIndex && viewIndex === 1 && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                      <div className="text-xs text-white/40 px-3 py-1 bg-black/20 rounded-full">
                        Swipe to navigate
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-100%);
            opacity: 0;
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0;
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </>
  )
}

// Helper function for time formatting
const formatTimeSince = (seconds: number) => {
  if (seconds < 60) return `${Math.floor(seconds)}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
