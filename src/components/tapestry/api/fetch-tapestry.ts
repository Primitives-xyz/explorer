import { createURL, FetchParams, fetchWrapper } from '@/components/utils/api'

export const fetchTapestry = async <
  ResponseType = unknown,
  InputType = Record<string, unknown>
>(
  args: FetchParams<InputType>
): Promise<ResponseType> => {
  if (!process.env.TAPESTRY_URL) {
    throw new Error('Missing env var TAPESTRY_URL')
  }

  if (!process.env.TAPESTRY_API_KEY) {
    throw new Error('Missing env var TAPESTRY_API_KEY')
  }

  const url = createURL({
    domain: process.env.TAPESTRY_URL,
    endpoint: args.endpoint,
  })

  return fetchWrapper({
    ...args,
    endpoint: url,
    queryParams: {
      ...args.queryParams,
      apiKey: process.env.TAPESTRY_API_KEY,
    },
    toBackend: false,
  })
}
