'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

type Transaction = {
  type: string
  source: string
  description: string
  fee: number
  timestamp: string
  signature: string
  success: boolean
  walletAddress: string
  username: string
  from: { amount: number; token: string }
  to: { amount: number; token: string }
  accountsInvolved: string[]
}

type Activity = {
  type: string
  text: string
  action: string
  wallet: string
  timestamp: number
  highlight: string
  amount?: string
  amountSuffix?: string
  isSSEBuy?: boolean
  signature?: string
}

// Store base timestamp for fake activities
const BASE_TIME = Math.floor(Date.now() / 1000) // Unix timestamp in seconds

const FAKE_ACTIVITIES: Activity[] = [
  {
    type: 'FOLLOW',
    text: 'DeGods.sol followed BeansDAO.sol',
    action: '👥',
    wallet: 'DeGods.sol',
    timestamp: BASE_TIME - 120, // 2 minutes ago
    highlight: 'neutral',
  },
  {
    type: 'TRANSFER',
    text: 'Whale transferred 50,000 USDC to Jito.sol',
    action: '💸',
    wallet: 'Bpf...2Eq',
    timestamp: BASE_TIME - 300, // 5 minutes ago
    highlight: 'positive',
    amount: '+50,000',
    amountSuffix: 'USDC',
  },
  {
    type: 'NFT_SALE',
    text: 'Mad Lads #1337 sold for 45 SOL',
    action: '🎨',
    wallet: 'Mad...Labs',
    timestamp: BASE_TIME - 480, // 8 minutes ago
    highlight: 'neutral',
    amount: '45 SOL',
  },
  {
    type: 'STAKE',
    text: 'Large stake delegation to Jito',
    action: '🔒',
    wallet: '7nZ...3tGy',
    timestamp: BASE_TIME - 600, // 10 minutes ago
    highlight: 'positive',
    amount: '+1000 SOL',
  },
  {
    type: 'SOCIAL',
    text: 'xNFT.sol reached 1000 followers',
    action: '🎯',
    wallet: 'xNFT.sol',
    timestamp: BASE_TIME - 900, // 15 minutes ago
    highlight: 'neutral',
  },
  {
    type: 'SWAP',
    text: 'Large BONK/SOL swap on Jupiter',
    action: '💱',
    wallet: '4m4...enSj',
    timestamp: BASE_TIME - 1200, // 20 minutes ago
    highlight: 'negative',
    amount: '-2.5M BONK',
  },
  {
    type: 'LIQUIDATION',
    text: 'Position liquidated on Drift',
    action: '⚠️',
    wallet: 'Drft...X2z',
    timestamp: BASE_TIME - 1500, // 25 minutes ago
    highlight: 'negative',
    amount: '-100K USDC',
  },
]

const ActivityTapeComponent = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const contentRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<Animation | null>(null)
  const mountedRef = useRef(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentTime, setCurrentTime] = useState(() =>
    Math.floor(Date.now() / 1000)
  )

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Configure scroll speed (pixels per second)
  const SCROLL_SPEED = 120 // Adjust this value to control speed

  const startAnimation = useCallback(() => {
    if (!contentRef.current || !mountedRef.current) return

    // Calculate content width and required duration
    const firstChild = contentRef.current.children[0] as HTMLElement
    const itemWidth = firstChild.offsetWidth
    const itemCount = contentRef.current.children.length
    const totalWidth = itemWidth * itemCount

    const duration = (totalWidth / SCROLL_SPEED) * 1000

    // Create animation
    animationRef.current = contentRef.current.animate(
      [
        { transform: 'translateX(0)' },
        { transform: `translateX(-${totalWidth / 2}px)` },
      ],
      { duration, iterations: Infinity }
    )

    if (isPaused) animationRef.current.pause()
  }, [isPaused])

  useEffect(() => {
    mountedRef.current = true
    const handleResize = () => {
      if (!mountedRef.current) return
      animationRef.current?.cancel()
      startAnimation()
    }

    startAnimation()
    window.addEventListener('resize', handleResize)
    return () => {
      mountedRef.current = false
      window.removeEventListener('resize', handleResize)
      animationRef.current?.cancel()
    }
  }, [startAnimation])

  useEffect(() => {
    if (!animationRef.current) return
    isPaused ? animationRef.current.pause() : animationRef.current.play()
  }, [isPaused])

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/feed')
        const data = await response.json()
        setTransactions(data.transactions)
      } catch (error) {
        console.error('Error fetching transactions:', error)
      }
    }

    fetchTransactions()
  }, [])

  const formatTimeAgo = (timestamp: number) => {
    const seconds = currentTime - timestamp
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m`
  }

  const getHighlightColor = (highlight: string) => {
    switch (highlight) {
      case 'positive':
        return 'text-green-400'
      case 'negative':
        return 'text-red-400'
      default:
        return ''
    }
  }

  // Convert real transactions to activity format
  const realActivities = transactions.map((tx) => ({
    type: tx.type,
    text: `${
      tx.username ||
      (tx.walletAddress
        ? tx.walletAddress.slice(0, 4) + '...' + tx.walletAddress.slice(-4)
        : '')
    } bought`,
    action: '💱',
    wallet: tx.username || tx.walletAddress,
    timestamp: Math.floor(new Date(tx.timestamp).getTime() / 1000),
    highlight: 'positive',
    amount: `${tx.to.amount.toFixed(2)} `,
    amountSuffix: 'SSE',
    isSSEBuy: true,
    signature: tx.signature,
  }))

  const allActivities = [...realActivities, ...FAKE_ACTIVITIES]

  return (
    <div className="border-b border-green-800 bg-black/50 group">
      <div className="p-1.5 flex items-center gap-2 font-mono">
        <div className="flex-none text-xs text-[color:var(--text-header)]">
          {'>'} network_feed.log
        </div>
        <div
          className="flex-1 overflow-hidden relative"
          style={{
            maskImage:
              'linear-gradient(to right, transparent, black 2%, black 98%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent, black 2%, black 98%, transparent)',
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={contentRef}
            className="flex gap-8 whitespace-nowrap"
            style={{
              willChange: 'transform',
              transform: 'translate3d(0, 0, 0)',
            }}
          >
            {[...allActivities, ...allActivities].map((activity, i) => (
              <Link
                key={i}
                href={activity.signature ? `/${activity.signature}` : '#'}
                className={
                  activity.signature ? 'cursor-pointer' : 'cursor-default'
                }
              >
                <div className="inline-flex items-center gap-2 transition-opacity hover:opacity-80 text-xs">
                  <span className="bg-green-900/20 px-1.5 py-0.5 rounded">
                    {activity.action}
                  </span>
                  <span className={getHighlightColor(activity.highlight)}>
                    {activity.text}
                  </span>
                  {activity.amount && (
                    <span
                      className={`${getHighlightColor(
                        activity.highlight
                      )} font-bold flex items-center gap-0.5 mr-2`}
                    >
                      {activity.amount}
                      {activity.amountSuffix}
                      {activity.isSSEBuy && (
                        <Image
                          src="/images/sse.png"
                          alt="SSE"
                          width={16}
                          height={16}
                          className="inline-block ml-0.5"
                        />
                      )}
                    </span>
                  )}
                  <span className="flex-shrink-0">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                  <span className="flex-shrink-0">•</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Export as client-only component
export const ActivityTape = dynamic(
  () => Promise.resolve(ActivityTapeComponent),
  {
    ssr: false,
  }
)
