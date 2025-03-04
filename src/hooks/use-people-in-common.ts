import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import useSWR from 'swr'

interface PersonInCommon {
  username: string
  image: string
}

interface PeopleInCommonResponse {
  profiles: PersonInCommon[]
  totalAmount: number
}

interface PaginationOptions {
  page?: number
  pageSize?: number
}

async function fetchTokenOwners(url: string): Promise<PeopleInCommonResponse> {
  const res = await fetch(url)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || 'Failed to fetch token owners')
  }
  return res.json()
}

export function usePeopleInCommon(
  tokenMint: string,
  { page = 1, pageSize = 1000 }: PaginationOptions = {}
) {
  const { mainUsername } = useCurrentWallet()
  const { data, error, isLoading } = useSWR<PeopleInCommonResponse>(
    `/api/tokens/${tokenMint}/holders?requestorId=${mainUsername}&page=${page}&pageSize=${pageSize}`,
    fetchTokenOwners,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 seconds
      revalidateIfStale: false,
      isPaused: () => !mainUsername || !tokenMint, // Skip the request if mainUsername or tokenMint not provided
    }
  )

  return {
    topUsers: data?.profiles || [],
    totalAmount: data?.totalAmount || 0,
    isLoading,
    error,
  }
}
