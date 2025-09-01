import { FetchMethod } from '@/utils/api/api.models'

export async function fetchTapestryServer<T = any>({
  endpoint,
  method = FetchMethod.GET,
  data,
}: {
  endpoint: string
  method?: FetchMethod
  data?: any
}): Promise<T> {
  const BASE_URL = process.env.TAPESTRY_URL?.replace(/\/+$/, '')
  const API_KEY = process.env.TAPESTRY_API_KEY
  const DEBUG = false

  if (!BASE_URL || !API_KEY) {
    throw new Error(
      'Missing required environment variables: TAPESTRY_URL or TAPESTRY_API_KEY'
    )
  }
  const cleanEndpoint = endpoint.replace(/^\/+/, '')

  // Add query parameter separator based on existing params
  const separator = cleanEndpoint.includes('?') ? '&' : '?'
  const url = `${BASE_URL}/${cleanEndpoint}${separator}apiKey=${API_KEY}`
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    if (DEBUG) {
      console.debug('[Tapestry] Request:', {
        method,
        url,
        hasBody: !!data,
      })
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      const errorText = await response.text()
      if (DEBUG) {
        console.error('[Tapestry] Error response:', {
          method,
          url,
          status: response.status,
          errorText,
        })
      }

      // Handle specific status codes
      switch (response.status) {
        case 404:
          throw new Error(
            `API endpoint or resource not found: ${cleanEndpoint}`
          )
        case 401:
          throw new Error('Invalid API key or unauthorized access')
        case 403:
          throw new Error(
            'Access forbidden - please check your API permissions'
          )
        case 429:
          throw new Error('Rate limit exceeded - please try again later')
        case 500:
          throw new Error(`Internal server error: ${errorText}`)
        case 502:
          throw new Error(
            `Tapestry API is temporarily unavailable - please try again later`
          )
        default:
          throw new Error(
            `HTTP error! status: ${response.status} - ${
              errorText || response.statusText
            }`
          )
      }
    }

    if (response.status === 204) {
      return {} as T
    }

    const responseData = await response.json()
    return responseData
  } catch (error: any) {
    // Log the full error for debugging

    throw error
  }
}
