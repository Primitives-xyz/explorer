'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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
  timestamp: Date
  highlight: string
  amount?: string
  amountSuffix?: string
  isSSEBuy?: boolean
  signature?: string
}

const FAKE_ACTIVITIES: Activity[] = [
  {
    type: 'FOLLOW',
    text: 'DeGods.sol followed BeansDAO.sol',
    action: '👥',
    wallet: 'DeGods.sol',
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    highlight: 'neutral',
  },
  {
    type: 'TRANSFER',
    text: 'Whale transferred 50,000 USDC to Jito.sol',
    action: '💸',
    wallet: 'Bpf...2Eq',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    highlight: 'positive',
    amount: '+50,000',
    amountSuffix: 'USDC',
  },
  {
    type: 'NFT_SALE',
    text: 'Mad Lads #1337 sold for 45 SOL',
    action: '🎨',
    wallet: 'Mad...Labs',
    timestamp: new Date(Date.now() - 1000 * 60 * 8), // 8 minutes ago
    highlight: 'neutral',
    amount: '45 SOL',
  },
  {
    type: 'STAKE',
    text: 'Large stake delegation to Jito',
    action: '🔒',
    wallet: '7nZ...3tGy',
    timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    highlight: 'positive',
    amount: '+1000 SOL',
  },
  {
    type: 'SOCIAL',
    text: 'xNFT.sol reached 1000 followers',
    action: '🎯',
    wallet: 'xNFT.sol',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    highlight: 'neutral',
  },
  {
    type: 'SWAP',
    text: 'Large BONK/SOL swap on Jupiter',
    action: '💱',
    wallet: '4m4...enSj',
    timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
    highlight: 'negative',
    amount: '-2.5M BONK',
  },
  {
    type: 'LIQUIDATION',
    text: 'Position liquidated on Drift',
    action: '⚠️',
    wallet: 'Drft...X2z',
    timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
    highlight: 'negative',
    amount: '-100K USDC',
  },
]

// Add custom animation class at the top level
const scrollAnimation = `
.scroll-container {
  width: 100%;
  overflow: hidden;
  position: relative;
  mask-image: linear-gradient(to right, transparent, black 2%, black 98%, transparent);
  height: 24px;
}

.scroll-content {
  display: flex;
  gap: 2rem;
  white-space: nowrap;
  min-width: 200%;
  position: relative;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-scroll {
  animation: scroll 60s linear infinite;
}

.group:hover .group-hover\\:pause {
  animation-play-state: paused;
}
`

export const ActivityTape = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])

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

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
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
    timestamp: new Date(tx.timestamp),
    highlight: 'positive',
    amount: `${tx.to.amount.toFixed(2)} `,
    amountSuffix: 'SSE',
    isSSEBuy: true,
    signature: tx.signature,
  }))

  const allActivities = [...realActivities, ...FAKE_ACTIVITIES]

  return (
    <>
      <style jsx global>
        {scrollAnimation}
      </style>
      <div className="border-b border-green-800 bg-black/50 group">
        <div className="p-1.5 flex items-center gap-2 font-mono">
          <div className="flex-none text-xs text-[color:var(--text-header)]">
            {'>'} network_feed.log
          </div>
          <div className="flex-1 scroll-container">
            <div className="scroll-content animate-scroll group-hover:pause">
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
                            src="/sse.png"
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
    </>
  )
}
