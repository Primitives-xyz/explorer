import { useQuery } from '@/utils/api/use-query'
import { useEffect, useState } from 'react'
import { IHomeTransaction } from '../home-transactions.models'

interface Props {
  skip?: boolean
  pageSize?: number
  infiniteScroll?: boolean
}

interface PaginatedResponse {
  data: IHomeTransaction[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

export function useGetHomeAllTransactions({
  skip = false,
  pageSize = 20,
  infiniteScroll = false,
}: Props) {
  const [page, setPage] = useState(1)
  const [allTransactions, setAllTransactions] = useState<IHomeTransaction[]>([])

  const { data, loading, error, refetch } = useQuery<PaginatedResponse>({
    endpoint: 'home-transactions/all',
    queryParams: {
      page,
      pageSize,
    },
    skip,
  })

  // Reset accumulated transactions when switching modes or on error
  useEffect(() => {
    if (!infiniteScroll || error) {
      setAllTransactions([])
      setPage(1)
    }
  }, [infiniteScroll, error])

  // Accumulate transactions for infinite scroll
  useEffect(() => {
    if (data?.data && infiniteScroll) {
      setAllTransactions((prev) => {
        // If it's the first page, replace all transactions
        if (page === 1) {
          return data.data
        }
        // Otherwise, append new transactions
        return [...prev, ...data.data]
      })
    }
  }, [data, page, infiniteScroll])

  const loadMore = () => {
    if (!loading && data?.pagination && page < data.pagination.totalPages) {
      setPage((prev) => prev + 1)
    }
  }

  const hasMore = data?.pagination ? page < data.pagination.totalPages : false

  return {
    transactions: infiniteScroll ? allTransactions : data?.data,
    pagination: data?.pagination,
    loading,
    error,
    loadMore,
    hasMore,
    currentPage: page,
    refetch,
  }
}
