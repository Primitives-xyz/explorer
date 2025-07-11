import { formatSmartNumber } from '@/utils/formatting/format-number'
import { useEffect, useState } from 'react'

export interface PlatformSSESavingsData {
  // Core data from API
  totalSavingsUSD: number
  totalTradesWithSSE: number
  totalTrades: number
  totalVolumeUSD: number
  averageSavingsPerTrade: number
  percentageUsingSSE: number
  potentialAdditionalSavings: number
  lastUpdated: string
  topSavers: Array<{
    profileId: string
    savingsUSD: number
    tradesWithSSE: number
  }>

  // Formatted values for display
  display: {
    totalSavings: string
    potentialSavings: string
    totalVolume: string
    savingsRate: string
    usageRate: string
    averageSavings: string
  }
}

export function usePlatformSSESavings() {
  const [data, setData] = useState<PlatformSSESavingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlatformSavings = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/platform/sse-savings')

      if (!response.ok) {
        throw new Error('Failed to fetch platform SSE savings')
      }

      const rawData = await response.json()

      // Calculate savings rate (savings per dollar traded)
      const savingsRate = rawData.totalVolumeUSD > 0 
        ? (rawData.totalSavingsUSD / rawData.totalVolumeUSD) * 100
        : 0

      const enhancedData: PlatformSSESavingsData = {
        ...rawData,
        display: {
          totalSavings: `$${formatSmartNumber(rawData.totalSavingsUSD, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          potentialSavings: `$${formatSmartNumber(
            rawData.potentialAdditionalSavings,
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}`,
          totalVolume: `$${formatSmartNumber(rawData.totalVolumeUSD, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`,
          savingsRate: `${savingsRate.toFixed(3)}%`,
          usageRate: `${rawData.percentageUsingSSE.toFixed(1)}%`,
          averageSavings: `$${formatSmartNumber(rawData.averageSavingsPerTrade, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        },
      }

      setData(enhancedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Force refresh the data (clears cache and recalculates)
  const refresh = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/platform/sse-savings', {
        method: 'POST', // POST endpoint forces refresh
      })

      if (!response.ok) {
        throw new Error('Failed to refresh platform SSE savings')
      }

      const rawData = await response.json()

      // Calculate savings rate
      const savingsRate = rawData.totalVolumeUSD > 0 
        ? (rawData.totalSavingsUSD / rawData.totalVolumeUSD) * 100
        : 0

      const enhancedData: PlatformSSESavingsData = {
        ...rawData,
        display: {
          totalSavings: `$${formatSmartNumber(rawData.totalSavingsUSD, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          potentialSavings: `$${formatSmartNumber(
            rawData.potentialAdditionalSavings,
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}`,
          totalVolume: `$${formatSmartNumber(rawData.totalVolumeUSD, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`,
          savingsRate: `${savingsRate.toFixed(3)}%`,
          usageRate: `${rawData.percentageUsingSSE.toFixed(1)}%`,
          averageSavings: `$${formatSmartNumber(rawData.averageSavingsPerTrade, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        },
      }

      setData(enhancedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlatformSavings()
  }, [])

  return { data, loading, error, refresh }
}

// Helper to format time since last update
export function getTimeSinceUpdate(lastUpdated: string): string {
  const now = new Date()
  const updated = new Date(lastUpdated)
  const diffMs = now.getTime() - updated.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}