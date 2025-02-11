import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { FetchMethod, fetchTapestry } from '@/utils/api'
import useSWR from 'swr'

interface PersonInCommon {
  username: string
  image: string
}

interface TokenOwnersResponse {
  profiles: PersonInCommon[]
  total: number
}

interface PeopleInCommonResponse {
  profiles: PersonInCommon[]
  totalAmount: number
}

interface PaginationOptions {
  page?: number
  pageSize?: number
}

export function usePeopleInCommon(
  tokenMint: string,
  { page = 1, pageSize = 1000 }: PaginationOptions = {},
) {
  const { mainUsername } = useCurrentWallet()

  const { data, error, isLoading } = useSWR<PeopleInCommonResponse>(
    tokenMint
      ? `/api/tokens/${tokenMint}/holders?requestorId=${mainUsername}&page=${page}&pageSize=${pageSize}`
      : null,
    async () => {
      try {
        const response = await fetchTapestry<TokenOwnersResponse>({
          endpoint: `profiles/token-owners/${tokenMint}?page=${page}&pageSize=${pageSize}${
            mainUsername ? `&requestorId=${mainUsername}` : ''
          }`,
          method: FetchMethod.GET,
        })

        if (!response) {
          throw new Error('No response received from API')
        }

        return {
          profiles: response.profiles || [],
          totalAmount: response.total || 0,
        }
      } catch (error) {
        console.error('[usePeopleInCommon Error]:', error)
        throw error
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 seconds
      revalidateIfStale: false,
    },
  )

  return {
    topUsers: data?.profiles || [],
    totalAmount: data?.totalAmount || 0,
    isLoading,
    error,
  }
}
