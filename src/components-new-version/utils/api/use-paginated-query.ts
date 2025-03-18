'use client'

import useSWRInfinite from 'swr/infinite'
import { FetchMethod } from './api.models'
import { fetchWrapper, getUrlWithQueryParameters } from './fetch-wrapper'

interface Props<T = unknown> {
  endpoint: string
  queryParams?: T
  pageSize?: number
  startAtPage?: number
}

export function usePaginatedQuery<ResponseType = unknown, InputType = unknown>({
  endpoint,
  queryParams,
  pageSize = 12,
  startAtPage = 1,
}: Props<InputType>): {
  data: ResponseType[] | undefined
  error: Error | undefined
  loading: boolean
  onLoadMore: () => void
  refetch: () => Promise<ResponseType[] | undefined>
} {
  const getKey = (pageIndex: number) => {
    if (endpoint) {
      return getUrlWithQueryParameters(endpoint, {
        page: pageIndex + startAtPage,
        pageSize,
        ...queryParams,
      })
    } else {
      return null
    }
  }

  const { data, size, setSize, error, isLoading, mutate } = useSWRInfinite<
    ResponseType,
    Error
  >(
    getKey,
    (endpoint: string) =>
      fetchWrapper<ResponseType>({
        method: FetchMethod.GET,
        endpoint,
      }),
    {
      revalidateFirstPage: false,
    },
  )

  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')

  return {
    data,
    error,
    loading: !!isLoadingMore,
    onLoadMore: () => setSize(size + 1),
    refetch: mutate,
  }
}
