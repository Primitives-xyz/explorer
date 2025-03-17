import { CollectionStats } from '@/types/nft/magic-eden/api'
import { useEffect, useState } from 'react'

interface UseCollectionStatsResult {
  collectionStat: CollectionStats | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useCollectionStats(
  collectionSymbol: string | null
): UseCollectionStatsResult {
  const [collectionStat, setCollectionStat] = useState<CollectionStats | null>(
    null
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCollectionStats = async () => {
    if (!collectionSymbol) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const collectionStatsRes = await fetch(
        `/api/magiceden/collection/${collectionSymbol}/stats`
      )

      if (!collectionStatsRes.ok) {
        const errorData = await collectionStatsRes.json()
        throw new Error(errorData.error || 'Failed to fetch collection stats')
      }

      const collectionStatsData = await collectionStatsRes.json()
      setCollectionStat(collectionStatsData)
    } catch (error) {
      console.error('Error fetching collection stats:', error)
      setError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCollectionStats()
  }, [collectionSymbol])

  return {
    collectionStat,
    isLoading,
    error,
    refetch: fetchCollectionStats,
  }
}
