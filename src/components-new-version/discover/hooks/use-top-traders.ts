'use client'

import { ITopTraders } from '@/components-new-version/models/token.models'
import { useEffect, useState } from 'react'

export enum TimeFrame {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  ONE_WEEK = '1W',
}

interface Props {
  timeFrame: TimeFrame
}

export const mockTopTraders = [
  {
    network: 'solana',
    address: 'So11111111111111111111111111111111111111112',
    pnl: 12453.75,
    trade_count: 18,
    volume: 58210.94,
  },
  {
    network: 'solana',
    address: '4xP3r71WzFvKk8NvxwEZ2oPiCKZ9UpHZfRM1PQGz5kY7',
    pnl: -4350.12,
    trade_count: 5,
    volume: 12000.5,
  },
  {
    network: 'solana',
    address: '7bnN98MxPUh6Fq3LPzJkYokEE9EmgFHQWDckjGowX9Ug',
    pnl: 980.4,
    trade_count: 2,
    volume: 450.0,
  },
  {
    network: 'solana',
    address: '3ZzXkjo3vbHX84Aa1NTyQ1Myzzw4nnoL52gTpCFcY4dH',
    pnl: 0,
    trade_count: 0,
    volume: 0,
  },
]

export const useTopTraders = ({ timeFrame }: Props) => {
  const [traders, setTraders] = useState<ITopTraders[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopTraders = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(
          `https://public-api.birdeye.so/trader/gainers-losers?type=${timeFrame}&sort_by=PnL&sort_type=desc&offset=0&limit=10`,
          {
            method: 'GET',
            headers: {
              accept: 'application/json',
              'x-chain': 'solana',
              'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '',
            },
          }
        )

        if (!response.ok) {
          throw new Error(
            `Failed to fetch top traders: ${response.status} ${response.statusText}`
          )
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || 'API request failed')
        }

        setTraders(data.data.items)
      } catch (err) {
        console.error('Error fetching top traders:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to fetch top traders'
        )
      } finally {
        setIsLoading(false)
      }
    }

    setTraders(mockTopTraders)
    fetchTopTraders()
  }, [timeFrame])

  return { traders, isLoading, error }
}
