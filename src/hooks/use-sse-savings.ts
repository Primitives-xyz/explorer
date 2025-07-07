import { PLATFORM_FEE_BPS } from '@/constants/jupiter'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useEffect, useState } from 'react'

const SSE_FEE_BPS = 1 // 0.01%

export interface SSESavingsData {
  // Core data from API
  totalSavingsUSD: number
  tradesWithSSE: number
  averageSavingsPerTrade: number
  totalTrades: number
  percentageUsingSSE: number
  potentialAdditionalSavings: number // If all trades used SSE
  savingsByPeriod?: {
    daily: number
    weekly: number
    monthly: number
  }

  // Enhanced calculations
  projectedAnnualSavings: number
  savingsPerDollarTraded: number
  totalVolumeTracked: number
  missingDataPercentage: number

  // Formatted values for display
  display: {
    totalSavings: string
    potentialSavings: string
    projectedAnnual: string
    savingsRate: string
    usageRate: string
  }
}

export function useSSESavings(walletAddress?: string) {
  const { walletAddress: currentWalletAddress } = useCurrentWallet()
  const address = walletAddress || currentWalletAddress

  const [data, setData] = useState<SSESavingsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      setData(null)
      return
    }

    const fetchSavings = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/wallet/sse-savings?wallet=${address}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch SSE savings')
        }

        const rawData = await response.json()

        // Calculate enhanced metrics
        const totalVolumeTracked = rawData.totalSavingsUSD / 0.0079 // Reverse calculate from savings
        const savingsPerDollarTraded =
          rawData.totalSavingsUSD / totalVolumeTracked
        const missingDataPercentage =
          ((rawData.totalTrades -
            (rawData.tradesWithSSE + rawData.totalTrades * 0.45)) /
            rawData.totalTrades) *
          100

        // Project annual savings based on current usage
        const averageDailyTrades = rawData.totalTrades / 30 // Assuming 30 days of data
        const projectedAnnualTrades = averageDailyTrades * 365
        const projectedAnnualSavings =
          rawData.averageSavingsPerTrade *
          projectedAnnualTrades *
          (rawData.percentageUsingSSE / 100)

        const enhancedData: SSESavingsData = {
          ...rawData,
          projectedAnnualSavings,
          savingsPerDollarTraded,
          totalVolumeTracked,
          missingDataPercentage,
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
            projectedAnnual: `$${formatSmartNumber(projectedAnnualSavings, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}`,
            savingsRate: `${(savingsPerDollarTraded * 100).toFixed(2)}%`,
            usageRate: `${rawData.percentageUsingSSE.toFixed(0)}%`,
          },
        }

        setData(enhancedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchSavings()
  }, [address])

  return { data, loading, error }
}

// Utility function to calculate savings from a single transaction
export function calculateTransactionSavings(
  swapUsdValue: number,
  usedSSE: boolean
): number {
  if (!usedSSE) return 0

  const regularFeeUSD = swapUsdValue * (PLATFORM_FEE_BPS / 10000)
  const sseFeeUSD = swapUsdValue * (SSE_FEE_BPS / 10000)

  return regularFeeUSD - sseFeeUSD
}

// Calculate aggregate savings across multiple wallets (e.g., for copy traders)
export async function calculateAggregateSSESavings(
  walletAddresses: string[]
): Promise<SSESavingsData> {
  const savingsPromises = walletAddresses.map(async (wallet) => {
    try {
      const response = await fetch(`/api/wallet/sse-savings?wallet=${wallet}`)
      if (!response.ok) return null
      return response.json()
    } catch {
      return null
    }
  })

  const allSavings = await Promise.all(savingsPromises)
  const validSavings = allSavings.filter(Boolean)

  // Aggregate the raw data
  const aggregated = validSavings.reduce(
    (acc, curr) => ({
      totalSavingsUSD: acc.totalSavingsUSD + curr.totalSavingsUSD,
      tradesWithSSE: acc.tradesWithSSE + curr.tradesWithSSE,
      totalTrades: acc.totalTrades + curr.totalTrades,
      potentialAdditionalSavings:
        acc.potentialAdditionalSavings + (curr.potentialAdditionalSavings || 0),
    }),
    {
      totalSavingsUSD: 0,
      tradesWithSSE: 0,
      totalTrades: 0,
      potentialAdditionalSavings: 0,
    }
  )

  const averageSavingsPerTrade =
    aggregated.tradesWithSSE > 0
      ? aggregated.totalSavingsUSD / aggregated.tradesWithSSE
      : 0

  const percentageUsingSSE =
    aggregated.totalTrades > 0
      ? (aggregated.tradesWithSSE / aggregated.totalTrades) * 100
      : 0

  // Calculate enhanced metrics
  const totalVolumeTracked = aggregated.totalSavingsUSD / 0.0079
  const savingsPerDollarTraded = aggregated.totalSavingsUSD / totalVolumeTracked
  const missingDataPercentage =
    ((aggregated.totalTrades -
      (aggregated.tradesWithSSE + aggregated.totalTrades * 0.45)) /
      aggregated.totalTrades) *
    100

  // Project annual savings
  const averageDailyTrades = aggregated.totalTrades / 30
  const projectedAnnualTrades = averageDailyTrades * 365
  const projectedAnnualSavings =
    averageSavingsPerTrade * projectedAnnualTrades * (percentageUsingSSE / 100)

  return {
    ...aggregated,
    averageSavingsPerTrade,
    percentageUsingSSE,
    projectedAnnualSavings,
    savingsPerDollarTraded,
    totalVolumeTracked,
    missingDataPercentage,
    display: {
      totalSavings: `$${formatSmartNumber(aggregated.totalSavingsUSD, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      potentialSavings: `$${formatSmartNumber(
        aggregated.potentialAdditionalSavings,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`,
      projectedAnnual: `$${formatSmartNumber(projectedAnnualSavings, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`,
      savingsRate: `${(savingsPerDollarTraded * 100).toFixed(2)}%`,
      usageRate: `${percentageUsingSSE.toFixed(0)}%`,
    },
  }
}
