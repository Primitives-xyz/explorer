import useSWR from 'swr'

export interface BirdeyeTokenOverview {
  address: string
  decimals: number
  symbol: string
  name: string
  extensions: {
    coingeckoId: string
    website: string
    telegram: string | null
    twitter: string
    description: string
    discord: string
    medium: string
  }
  logoURI: string
  liquidity: number
  price: number
  priceChange24hPercent: number
  supply: number
  mc: number
  circulatingSupply: number
  realMc: number
  holder: number
  v24h: number
  v24hUSD: number
  numberMarkets: number
  uniqueWallet24h: number
  trade24h: number
}

interface BirdeyeResponse {
  data: BirdeyeTokenOverview
  success: boolean
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useBirdeyeTokenOverview(address: string) {
  const { data, error, isLoading } = useSWR<BirdeyeResponse>(
    `/api/token/birdeye/overview?address=${address}`,
    fetcher,
    {
      refreshInterval: 7500, // Refresh every 7.5 seconds (slightly longer than server cache)
      revalidateOnFocus: false, // Disable revalidation on focus since we're polling
    },
  )

  return {
    overview: data?.data,
    isLoading,
    error: error || (data?.success === false ? data : null),
  }
}
