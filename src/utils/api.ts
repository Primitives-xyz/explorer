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

interface ProfileResponse {
  profiles: Profile[]
  page: number
  pageSize: number
}

interface FollowStats {
  followers: number
  following: number
}

export const ITEMS_PER_PAGE = 10

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

export async function getFollowStats(username: string): Promise<FollowStats> {
  const [followersRes, followingRes] = await Promise.all([
    fetch(`/api/profiles/${username}/followers`),
    fetch(`/api/profiles/${username}/following`),
  ])

  if (!followersRes.ok || !followingRes.ok) {
    throw new Error('Failed to fetch follow stats')
  }

  const followers = await followersRes.json()
  const following = await followingRes.json()

  return {
    followers: followers.total,
    following: following.total,
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

export async function getSwapTransactions(walletAddress: string) {
  const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Filter transactions from 2024 that are swaps
    const swapsFrom2024 = data.filter((tx: any) => {
      const timestamp = tx.timestamp;
      const date = new Date(timestamp * 1000);
      const isFrom2024 = date.getFullYear() === 2024;
      return isFrom2024 && tx.type === "SWAP";
    });

    return swapsFrom2024.length;
  } catch (error) {
    console.error("Error fetching swap transactions:", error);
    return 0;
  }
}
