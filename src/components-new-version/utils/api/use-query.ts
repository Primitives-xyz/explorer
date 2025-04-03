'use client'

import { getAuthToken } from '@dynamic-labs/sdk-react-core'
import useSWR, { SWRConfiguration } from 'swr'
import { FetchMethod, IError } from './api.models'
import {
  fetchWrapper,
  getUrlWithPathParameters,
  getUrlWithQueryParameters,
} from './fetch-wrapper'

interface UseQueryProps {
  endpoint: string
  pathParams?: Record<string, string>
  queryParams?: Record<string, string | number | boolean>
  skip?: boolean
  config?: SWRConfiguration
  toBackend?: boolean
  bypassCache?: boolean
}

export function useQuery<ResponseType = unknown, Error = IError>({
  endpoint: _endpoint,
  queryParams,
  pathParams,
  skip,
  config,
  toBackend = true,
  bypassCache,
}: UseQueryProps) {
  const authToken = getAuthToken()
  const shouldFetch = !!_endpoint && !skip

  let endpoint = _endpoint

  if (shouldFetch) {
    endpoint = getUrlWithPathParameters({
      endpoint,
      pathParams,
    })
  }

  endpoint = getUrlWithQueryParameters(endpoint, queryParams)

  const { data, error, isLoading, mutate } = useSWR<ResponseType, Error>(
    shouldFetch ? endpoint : null,
    async (endpoint: string) =>
      fetchWrapper<ResponseType>({
        method: FetchMethod.GET,
        endpoint,
        toBackend,
        bypassCache,
        jwt: authToken,
      }),
    config
  )

  return {
    data,
    error,
    loading: isLoading,
    refetch: mutate,
  }
}

export type { UseQueryProps }
