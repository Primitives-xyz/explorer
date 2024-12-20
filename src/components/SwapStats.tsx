'use client'

import { getSwapTransactions } from '@/utils/api'
import { useEffect, useState } from 'react'

interface SwapStatsProps {
  walletAddress: string
}

export function SwapStats({ walletAddress }: SwapStatsProps) {
  const [swapCount, setSwapCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSwapCount() {
      try {
        const count = await getSwapTransactions(walletAddress)
        setSwapCount(count)
      } catch (error) {
        console.error('Error fetching swap count:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSwapCount()
  }, [walletAddress])

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="stats-card">
          <div className="stats-value">Loading...</div>
          <div className="stats-label">Swaps in 2024</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="stats-card">
        <div className="stats-value">{swapCount}</div>
        <div className="stats-label">Swaps in 2024</div>
      </div>
    </div>
  )
} 