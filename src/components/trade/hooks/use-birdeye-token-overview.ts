import { BirdeyeTokenOverview } from '@/components/tapestry/models/token.models'
import useSWR from 'swr'

interface BirdeyeResponse {
  data: BirdeyeTokenOverview
  success: boolean
}

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '',
    },
  })
  if (!response.ok) {
    throw new Error('Failed to fetch token overview')
  }
  return response.json()
}

export function useBirdeyeTokenOverview(address: string) {
  const { data, error, isLoading } = useSWR<BirdeyeResponse>(
    `https://public-api.birdeye.so/defi/token_overview?address=${address}`,
    fetcher,
    {
      refreshInterval: 7500, // Refresh every 7.5 seconds
      revalidateOnFocus: false, // Disable revalidation on focus since we're polling
    }
  )

  return {
    overview: data?.data,
    isLoading,
    error: error || (data?.success === false ? data : null),
  }
}
