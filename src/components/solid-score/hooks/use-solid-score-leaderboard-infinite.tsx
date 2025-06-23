'use client'

import { ISolidScoreLeaderboardResponse } from '@/components/tapestry/models/solid.score.models'
import { useQuery } from '@/utils/api'
import { useCallback, useEffect, useState } from 'react'

interface PaginatedLeaderboardResponse {
  data: ISolidScoreLeaderboardResponse[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
}

interface Props {
  pageSize?: number
}

export function useSolidScoreLeaderboardInfinite({
  pageSize = 20,
}: Props = {}) {
  const [page, setPage] = useState(1)
  const [allData, setAllData] = useState<ISolidScoreLeaderboardResponse[]>([])
  const [hasMore, setHasMore] = useState(true)

  const {
    data,
    error,
    loading,
    refetch: originalRefetch,
  } = useQuery<PaginatedLeaderboardResponse>({
    endpoint: 'solid-score/leaderboard',
    queryParams: {
      page,
      pageSize,
    },
  })

  useEffect(() => {
    if (page === 1) {
      setAllData([])
    }
  }, [page])

  useEffect(() => {
    if (data?.data) {
      setAllData((prev) => {
        if (page === 1) {
          return data.data
        }
        return [...prev, ...data.data]
      })
      setHasMore(data.pagination.hasMore)
    }
  }, [data, page])

  const onLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1)
    }
  }, [loading, hasMore])

  const refetch = useCallback(async () => {
    setPage(1)
    setAllData([])
    setHasMore(true)
    return originalRefetch()
  }, [originalRefetch])

  return {
    data: allData,
    error,
    loading,
    hasMore,
    onLoadMore,
    refetch,
  }
}
