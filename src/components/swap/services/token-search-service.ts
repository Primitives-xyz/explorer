import { ITokenSearchResult } from '@/components/swap/swap.models'
import { DEFAULT_TOKENS } from '@/components/swap/utils/token-utils'

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
      .filter((item: any) => {
        // More strict validation to prevent invalid tokens
        return (
          item &&
          typeof item.symbol === 'string' &&
          typeof item.name === 'string' &&
          typeof item.decimals === 'number' &&
          item.decimals >= 0 &&
          typeof item.address === 'string' &&
          item.address.length >= 32
        )
      })
      .map((item: any) => ({
        address: item.address,
        symbol: item.symbol || 'Unknown',
        name: item.name || 'Unknown Token',
        decimals: item.decimals,
        logoURI: item.logo_uri || '',
        price: typeof item.price === 'number' ? item.price : 0,
        volume_24h_usd:
          typeof item.volume_24h_usd === 'number' ? item.volume_24h_usd : 0,
        verified: Boolean(item.verified),
        market_cap: typeof item.market_cap === 'number' ? item.market_cap : 0,
      }))
  } catch (error) {
    console.error('Error searching tokens by keyword:', error)
    // Return empty array instead of throwing to prevent UI errors
    return []
  }
}
