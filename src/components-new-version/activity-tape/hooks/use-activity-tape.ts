'use client'

import {
  IActivity,
  ITransaction,
} from '@/components-new-version/models/transaction.model'
import { useCallback, useEffect, useRef, useState } from 'react'

// Store base timestamp for fake activities
const BASE_TIME = Math.floor(Date.now() / 1000) // Unix timestamp in seconds

const FAKE_ACTIVITIES: IActivity[] = [
  {
    type: 'FOLLOW',
    text: 'DeGods.sol followed BeansDAO.sol',
    action: '👥',
    wallet: 'DeGods.sol',
    timestamp: BASE_TIME - 120,
    highlight: 'neutral',
  },
  {
    type: 'TRANSFER',
    text: 'Whale transferred 50,000 USDC to Jito.sol',
    action: '💸',
    wallet: 'Bpf...2Eq',
    timestamp: BASE_TIME - 300,
    highlight: 'positive',
    amount: '+50,000',
    amountSuffix: 'USDC',
  },
  {
    type: 'NFT_SALE',
    text: 'Mad Lads #1337 sold for 45 SOL',
    action: '🎨',
    wallet: 'Mad...Labs',
    timestamp: BASE_TIME - 480,
    highlight: 'neutral',
    amount: '45 SOL',
  },
  {
    type: 'STAKE',
    text: 'Large stake delegation to Jito',
    action: '🔒',
    wallet: '7nZ...3tGy',
    timestamp: BASE_TIME - 600,
    highlight: 'positive',
    amount: '+1000 SOL',
  },
  {
    type: 'SOCIAL',
    text: 'xNFT.sol reached 1000 followers',
    action: '🎯',
    wallet: 'xNFT.sol',
    timestamp: BASE_TIME - 900,
    highlight: 'neutral',
  },
  {
    type: 'SWAP',
    text: 'Large BONK/SOL swap on Jupiter',
    action: '💱',
    wallet: '4m4...enSj',
    timestamp: BASE_TIME - 1200,
    highlight: 'negative',
    amount: '-2.5M BONK',
  },
  {
    type: 'LIQUIDATION',
    text: 'Position liquidated on Drift',
    action: '⚠️',
    wallet: 'Drft...X2z',
    timestamp: BASE_TIME - 1500,
    highlight: 'negative',
    amount: '-100K USDC',
  },
]

export function useActivityTape() {
  const [transactions, setTransactions] = useState<ITransaction[]>([])
  const contentRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<Animation | null>(null)
  const mountedRef = useRef(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentTime, setCurrentTime] = useState(() =>
    Math.floor(Date.now() / 1000)
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const SCROLL_SPEED = 120

  const startAnimation = useCallback(() => {
    if (!contentRef.current || !mountedRef.current) return

    const firstChild = contentRef.current.children[0] as HTMLElement
    const itemWidth = firstChild.offsetWidth
    const itemCount = contentRef.current.children.length
    const totalWidth = itemWidth * itemCount

    const duration = (totalWidth / SCROLL_SPEED) * 1000

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
    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m`
  }

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

  return {
    allActivities: [...realActivities, ...FAKE_ACTIVITIES],
    contentRef,
    isPaused,
    formatTimeAgo,
    setIsPaused,
  }
}
