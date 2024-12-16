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
  const BASE_URL = process.env.TAPESTRY_URL
  const API_KEY = process.env.TAPESTRY_API_KEY

  if (!BASE_URL || !API_KEY) {
    throw new Error('Missing required environment variables')
  }

  const url = `${BASE_URL}/${endpoint}?apiKey=${API_KEY}`

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  }

  if (data && method !== FetchMethod.GET) {
    options.body = JSON.stringify(data)
  }

  const response = await fetch(url, options)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Tapestry API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
    })
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    )
  }

  return response.json()
}
