import useSWR from 'swr'

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

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

export function useCopyTradeStats(walletAddress?: string) {
  const { data, error, isLoading } = useSWR<{ stats: CopyTradeStats }>(
    walletAddress
      ? `/api/copy-trades/analytics?walletAddress=${walletAddress}`
      : null,
    fetcher
  )

  return {
    data: data?.stats || null,
    error,
    isLoading,
  }
}

export function useCopyTradeOverview() {
  const { data, error, isLoading } = useSWR<{ overview: CopyTradeOverview }>(
    '/api/copy-trades/analytics',
    fetcher
  )

  return {
    data: data?.overview,
    error,
    isLoading,
  }
}

export function useCopyTradeLeaderboard(
  period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'weekly'
) {
  const { data, error, isLoading } = useSWR(
    `/api/copy-trades/leaderboard?period=${period}`,
    fetcher
  )

  return {
    data,
    error,
    isLoading,
  }
}

export function usePendingPayments(walletAddress?: string) {
  const { data, error, isLoading } = useSWR(
    walletAddress
      ? `/api/copy-trades/payments/pending?walletAddress=${walletAddress}`
      : null,
    fetcher
  )

  return {
    data: data || [],
    error,
    isLoading,
  }
}
