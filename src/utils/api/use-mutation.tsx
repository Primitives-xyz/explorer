'use client'

import { getAuthToken } from '@dynamic-labs/sdk-react-core'
import useSWRMutation from 'swr/mutation'
import { FetchMethod, IError } from './api.models'
import { fetchWrapper, getUrlWithQueryParameters } from './fetch-wrapper'

interface Props {
  endpoint: string
  method?: FetchMethod
  queryParams?: Record<string, string>
}

export function useMutation<
  ResponseType = unknown,
  InputType = Record<string, unknown>,
  ErrorType = IError
>({ endpoint, method = FetchMethod.POST, queryParams }: Props) {
  const authToken = getAuthToken()

  endpoint = getUrlWithQueryParameters(endpoint, queryParams)

  const { data, error, isMutating, trigger } = useSWRMutation<
    ResponseType,
    ErrorType,
    string | null,
    InputType
  >(endpoint, async (endpoint: string, args: { arg: InputType }) =>
    fetchWrapper<ResponseType, InputType>({
      method,
      endpoint,
      body: args.arg,
      jwt: authToken,
    })
  )

  return {
    data,
    error,
    loading: isMutating,
    mutate: trigger,
  }
}
