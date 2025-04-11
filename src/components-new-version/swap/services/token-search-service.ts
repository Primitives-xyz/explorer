import { ITokenSearchResult } from '@/components-new-version/swap/swap.models'
import { DEFAULT_TOKENS } from '@/components-new-version/swap/utils/token-utils'

export async function searchTokensByAddress(
  address: string
): Promise<ITokenSearchResult | null> {
  try {
    const response = await fetch(
      `https://api.jup.ag/tokens/v1/token/${address}`,
      {
        headers: {
          accept: 'application/json',
        },
      }
    )

    if (!response.ok) {
      return null
    }

    const token = await response.json()
    if (!token) {
      return null
    }

    // Map Jupiter token to our common format
    return {
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      logoURI: token.logoURI,
      price: null, // Jupiter doesn't provide price
      volume_24h_usd: token.daily_volume || 0,
      verified: token.tags?.includes('verified') || false,
      market_cap: 0, // Jupiter doesn't provide market cap
    }
  } catch (error) {
    console.error('Error searching token by address:', error)
    return null
  }
}

export async function searchTokensByKeyword(
  query: string,
  verifiedOnly: boolean
): Promise<ITokenSearchResult[]> {
  if (!query.trim()) {
    return DEFAULT_TOKENS
  }

  try {
    const response = await fetch(
      `https://public-api.birdeye.so/defi/v3/search?chain=solana&keyword=${encodeURIComponent(
        query
      )}&target=token&sort_by=marketcap&sort_type=desc&verify_token=${verifiedOnly}&offset=0&limit=20`,
      {
        headers: {
          'X-API-KEY': 'ce36cc09be9d41d68f9fd4c45346c9f3',
          accept: 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch tokens')
    }

    const data = await response.json()
    if (!data.success || !data.data?.items?.[0]?.result) {
      return []
    }

    return data.data.items[0].result
      .filter((item: any) => item.symbol && item.name && item.decimals)
      .map((item: any) => ({
        address: item.address,
        symbol: item.symbol || 'Unknown',
        name: item.name || 'Unknown Token',
        decimals: item.decimals,
        logoURI: item.logo_uri,
        price: item.price,
        volume_24h_usd: item.volume_24h_usd || 0,
        verified: item.verified || false,
        market_cap: item.market_cap || 0,
      }))
  } catch (error) {
    console.error('Error searching tokens by keyword:', error)
    throw error
  }
}
