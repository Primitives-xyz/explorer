import type { PaginatedData } from '@/types/pagination'
import { IGetProfileResponse } from '@/types/profile.types'

export enum FetchMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export const ITEMS_PER_PAGE = 20

export async function getProfiles(
  walletAddress: string,
  useIdentities: boolean = false,
  page: number = 1
): Promise<PaginatedData<IGetProfileResponse>> {
  try {
    let response
    if (useIdentities) {
      response = await fetch(
        `/api/identities?walletAddress=${walletAddress}&page=${page}&limit=${ITEMS_PER_PAGE}`
      )
    } else {
      response = await fetch(
        `/api/profiles?walletAddress=${walletAddress}&page=${page}&limit=${ITEMS_PER_PAGE}`
      )
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    return {
      items: data.profiles || [],
      hasMore: data.profiles.length === ITEMS_PER_PAGE,
      page: data.page,
      pageSize: data.pageSize,
    }
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

export async function fetchTapestry<T>({
  endpoint,
  method = FetchMethod.GET,
  data,
}: {
  endpoint: string
  method?: FetchMethod
  data?: unknown
}): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
  const url = `${baseUrl}/${endpoint}`
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (data) {
    options.body = JSON.stringify(data)
  }

  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export const createErrorResponse = (
  error: unknown,
  customMessage?: string,
  statusCode = 500
) => {
  console.error('API Error:', error)

  const errorMessage =
    customMessage || 'An error occurred processing your request'
  const detailedMessage = error instanceof Error ? error.message : String(error)

  return Response.json(
    {
      error: errorMessage,
      message: detailedMessage,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  )
}
