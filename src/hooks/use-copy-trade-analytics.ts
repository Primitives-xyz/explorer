import { useQuery } from '@tanstack/react-query'

interface CopyTradeStats {
  walletAddress: string
  username?: string
  profileImage?: string

  asSource: {
    totalTradesCopied: number
    uniqueCopiers: number
    totalVolumeGeneratedUsd: number
    totalProfitGeneratedUsd: number
    pendingPaymentsUsd: number
  }

  asCopier: {
    totalTradesCopiedFrom: number
    uniqueSourceTraders: number
    totalVolumeCopiedUsd: number
    totalProfitFromCopiesUsd: number
  }

  last24h: {
    tradesCopied: number
    volumeGeneratedUsd: number
    profitGeneratedUsd: number
  }
}

interface CopyTradeOverview {
  totalCopyTrades: number
  totalVolumeUsd: number
  totalProfitGeneratedUsd: number
  totalPaymentsUsd: number
  activeSourceTraders: number
  activeCopiers: number
}

export function useCopyTradeStats(walletAddress?: string) {
  return useQuery({
    queryKey: ['copy-trade-stats', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null

      const response = await fetch(
        `/api/copy-trades/analytics?walletAddress=${walletAddress}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch copy trade stats')
      }

      const data = await response.json()
      return data.stats as CopyTradeStats
    },
    enabled: !!walletAddress,
  })
}

export function useCopyTradeOverview() {
  return useQuery({
    queryKey: ['copy-trade-overview'],
    queryFn: async () => {
      const response = await fetch('/api/copy-trades/analytics')
      if (!response.ok) {
        throw new Error('Failed to fetch copy trade overview')
      }

      const data = await response.json()
      return data.overview as CopyTradeOverview
    },
  })
}

export function useCopyTradeLeaderboard(
  period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'weekly'
) {
  return useQuery({
    queryKey: ['copy-trade-leaderboard', period],
    queryFn: async () => {
      const response = await fetch(
        `/api/copy-trades/leaderboard?period=${period}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch copy trade leaderboard')
      }

      return response.json()
    },
  })
}

export function usePendingPayments(walletAddress?: string) {
  return useQuery({
    queryKey: ['pending-payments', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return []

      const response = await fetch(
        `/api/copy-trades/payments/pending?walletAddress=${walletAddress}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch pending payments')
      }

      return response.json()
    },
    enabled: !!walletAddress,
  })
}
