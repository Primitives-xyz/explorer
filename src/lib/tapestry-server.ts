import { FetchMethod } from '@/utils/api'

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

  if (!BASE_URL || !API_KEY) {
    throw new Error(
      'Missing required environment variables: TAPESTRY_URL or TAPESTRY_API_KEY',
    )
  }
  const cleanEndpoint = endpoint.replace(/^\/+/, '')

  // Add query parameter separator based on existing params
  const separator = cleanEndpoint.includes('?') ? '&' : '?'
  const url = `${BASE_URL}/${cleanEndpoint}${separator}apiKey=${API_KEY}`

  console.log('TAPESTRY-SERVER', url)

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

    console.log('======================')
    console.log('OPTIONS', options)
    console.log('URL', url)

    const response = await fetch(url, options)

    console.log('======================')
    console.log('RESPONSE', response)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Tapestry API Error from route: ', url, {
        status: response.status,
        statusText: response.statusText,
        endpoint: cleanEndpoint,
        error: errorText,
      })

      // Handle specific status codes
      switch (response.status) {
        case 404:
          throw new Error(`API endpoint not found: ${cleanEndpoint}`)
        case 401:
          throw new Error('Invalid API key or unauthorized access')
        case 403:
          throw new Error(
            'Access forbidden - please check your API permissions',
          )
        case 429:
          throw new Error('Rate limit exceeded - please try again later')
        case 500:
          throw new Error(`Internal server error: ${errorText}`)
        case 502:
          throw new Error(
            `Tapestry API is temporarily unavailable - please try again later`,
          )

        default:
          throw new Error(
            `HTTP error! status: ${response.status} - ${
              errorText || response.statusText
            }`,
          )
      }
    }

    const responseData = await response.json()
    return responseData
  } catch (error: any) {
    // Log the full error for debugging
    console.error('Tapestry Server Error:', {
      error: error.message,
      stack: error.stack,
      endpoint: cleanEndpoint,
    })
    throw error
  }
}

export const tapestryServer = {
  async likeComment(commentId: string, profileId: string) {
    return fetchTapestryServer({
      endpoint: `likes/${commentId}`,
      method: FetchMethod.POST,
      data: { startId: profileId },
    })
  },

  async unlikeComment(commentId: string, profileId: string) {
    return fetchTapestryServer({
      endpoint: `likes/${commentId}`,
      method: FetchMethod.DELETE,
      data: { startId: profileId },
    })
  },

  async createComment({
    profileId,
    targetProfileId,
    text,
    commentId,
  }: {
    profileId: string
    targetProfileId: string
    text: string
    commentId?: string
  }) {
    return fetchTapestryServer({
      endpoint: 'comments',
      method: FetchMethod.POST,
      data: {
        profileId,
        targetProfileId,
        text,
        ...(commentId && { commentId }),
      },
    })
  },
}
