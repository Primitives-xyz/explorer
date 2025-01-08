import { PaginatedData } from '@/types/pagination'

export enum FetchMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export interface Profile {
  profile: {
    id: string
    namespace: string
    username: string
    bio: string | null
    image: string | null
    blockchain: string
    created_at: number
  }
  wallet: {
    address: string
  }
  namespace: {
    id: number
    name: string
    readableName: string
    faviconURL: string
    createdAt: string
    updatedAt: string
    isDefault: boolean
    team_id: number
  }
}

export const ITEMS_PER_PAGE = 20

export async function getProfiles(
  walletAddress: string,
  page: number = 1,
): Promise<PaginatedData<Profile>> {
  try {
    const response = await fetch(
      `/api/profiles?walletAddress=${walletAddress}&page=${page}&limit=${ITEMS_PER_PAGE}`,
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      )
    }

    const data = await response.json()
    console.log('data', data)
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

export interface TokenMetadata {
  name: string
  symbol: string
  description?: string
  imageUrl?: string
  tokenStandard?: string
  decimals?: number
  token_info?: {
    supply: number
    decimals: number
    token_program: string
    price_info?: {
      price_per_token: number
      currency: string
      volume_24h?: number
    }
  }
  priceInfo?: {
    pricePerToken: number
    currency: string
    volume24h?: number
  }
}

export async function fetchTokenMetadata(mint: string): Promise<TokenMetadata | null> {
  try {
    const response = await fetch(`/api/tokens/${mint}`)
    if (!response.ok) {
      console.error(`Failed to fetch metadata for token ${mint}:`, response.statusText)
      return null
    }
    const data = await response.json()
    
    // Normalize the metadata structure
    return {
      name: data.content?.metadata?.name || data.name || '',
      symbol: data.content?.metadata?.symbol || data.symbol || '',
      description: data.content?.metadata?.description,
      imageUrl: data.content?.links?.image || data.content?.files?.[0]?.cdn_uri || data.content?.files?.[0]?.uri,
      tokenStandard: data.content?.metadata?.token_standard || data.interface,
      decimals: data.token_info?.decimals,
      token_info: data.token_info,
      priceInfo: data.token_info?.price_info ? {
        pricePerToken: data.token_info.price_info.price_per_token,
        currency: data.token_info.price_info.currency,
        volume24h: data.token_info.price_info.volume_24h
      } : undefined
    }
  } catch (error) {
    console.error('Error fetching token metadata:', error)
    return null
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
