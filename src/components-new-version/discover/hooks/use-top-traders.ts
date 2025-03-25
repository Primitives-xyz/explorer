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

    fetchTopTraders()
  }, [timeFrame])

  return { traders, isLoading, error }
}
