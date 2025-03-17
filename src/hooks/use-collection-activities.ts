import { useEffect, useState } from 'react'

interface CollectionActivity {
  signature: string
  type: 'buyNow' | 'list' | 'delist' | 'bid' | 'cancelBid'
  source: string
  tokenMint: string
  collection: string
  slot: number
  blockTime: number
  buyer?: string
  seller?: string
  price?: number
  date?: string
}

interface PaginationInfo {
  limit: number
  offset: number
  total: number
  hasMore: boolean
}

interface UseCollectionActivitiesResult {
  activities: CollectionActivity[]
  pagination: PaginationInfo | null
  isLoading: boolean
  error: string | null
  fetchNextPage: () => Promise<void>
  refetch: () => Promise<void>
}

interface UseCollectionActivitiesOptions {
  limit?: number
  type?: 'all' | 'buyNow' | 'list' | 'delist' | 'bid' | 'cancelBid'
}

export function useCollectionActivities(
  collectionSymbol: string | null,
  options: UseCollectionActivitiesOptions = {}
): UseCollectionActivitiesResult {
  const [activities, setActivities] = useState<CollectionActivity[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const { limit = 20, type = 'all' } = options

  const fetchActivities = async (offset = 0, append = false) => {
    if (!collectionSymbol) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Construct the URL with query parameters
      const url = new URL(
        `/api/magiceden/collection/${collectionSymbol}/activities`,
        window.location.origin
      )
      url.searchParams.append('limit', limit.toString())
      url.searchParams.append('offset', offset.toString())
      if (type !== 'all') {
        url.searchParams.append('type', type)
      }

      const response = await fetch(url.toString())

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || 'Failed to fetch collection activities'
        )
      }

      const data = await response.json()

      if (append) {
        setActivities((prev) => [...prev, ...data.activities])
      } else {
        setActivities(data.activities)
      }

      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching collection activities:', error)
      setError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNextPage = async () => {
    if (pagination && pagination.hasMore && !isLoading) {
      await fetchActivities(pagination.offset + pagination.limit, true)
    }
  }

  const refetch = async () => {
    await fetchActivities(0, false)
  }

  useEffect(() => {
    fetchActivities(0, false)
  }, [collectionSymbol, limit, type])

  return {
    activities,
    pagination,
    isLoading,
    error,
    fetchNextPage,
    refetch,
  }
}
