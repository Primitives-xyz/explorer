import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { FetchMethod, fetchTapestry } from '@/utils/api'
import useSWR from 'swr'

interface Profile {
  id: string
  username: string
  image: string
  role: string
  namespace: string
  bio: string
  created_at: number
}

interface TokenOwnersResponse {
  profiles: Profile[]
  page: number
  pageSize: number
}

interface PeopleInCommonResponse {
  profiles: Profile[]
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

        // Transform the response to match what PeopleInCommonSection expects
        return {
          profiles: response.profiles.map((profile) => ({
            ...profile,
            // Keep only the fields needed by PeopleInCommonSection
            username: profile.username,
            image: profile.image,
          })),
          totalAmount: response.profiles.length,
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
