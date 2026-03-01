import { ITokenSearchResult } from '@/components/swap/swap.models'
import { DEFAULT_TOKENS } from '@/components/swap/utils/token-utils'

interface JupiterTokenV2 {
  id: string
  name: string
  symbol: string
  icon?: string
  decimals: number
  holderCount?: number
  organicScore?: number
  organicScoreLabel?: string
  isVerified?: boolean
  tags?: string[]
  fdv?: number
  mcap?: number
  usdPrice?: number
  liquidity?: number
  stats24h?: {
    priceChange?: number
    buyVolume?: number
    sellVolume?: number
    numBuys?: number
    numSells?: number
    numTraders?: number
  }
}

function mapJupiterTokenToResult(token: JupiterTokenV2): ITokenSearchResult {
  const volume24h =
    (token.stats24h?.buyVolume || 0) + (token.stats24h?.sellVolume || 0)

  return {
    address: token.id,
    symbol: token.symbol || 'Unknown',
    name: token.name || 'Unknown Token',
    decimals: token.decimals,
    logoURI: token.icon || '',
    price: token.usdPrice ?? null,
    volume_24h_usd: volume24h,
    verified: token.isVerified ?? false,
    market_cap: token.mcap || 0,
    holderCount: token.holderCount,
    organicScore: token.organicScore,
    organicScoreLabel: token.organicScoreLabel,
    liquidity: token.liquidity,
    fdv: token.fdv,
    priceChange24h: token.stats24h?.priceChange,
    numTraders24h: token.stats24h?.numTraders,
  }
}

export async function searchTokensByQuery(
  query: string
): Promise<ITokenSearchResult[]> {
  if (!query.trim()) {
    return DEFAULT_TOKENS
  }

  try {
    const url = new URL('/api/jupiter/tokens/search', window.location.origin)
    url.searchParams.set('query', query)

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error('Failed to search tokens')
    }

    const data: JupiterTokenV2[] = await response.json()

    if (!Array.isArray(data)) {
      return []
    }

    return data
      .filter(
        (token) =>
          token &&
          typeof token.symbol === 'string' &&
          typeof token.name === 'string' &&
          typeof token.decimals === 'number' &&
          token.decimals >= 0 &&
          typeof token.id === 'string' &&
          token.id.length >= 32
      )
      .map(mapJupiterTokenToResult)
  } catch (error) {
    console.error('Error searching tokens via Jupiter V2:', error)
    return []
  }
}

export async function fetchTrendingTokens(
  category: 'toptraded' | 'toptrending' | 'toporganicscore' = 'toptraded',
  interval: '5m' | '1h' | '6h' | '24h' = '24h',
  limit: number = 20
): Promise<ITokenSearchResult[]> {
  try {
    const url = new URL('/api/jupiter/tokens/trending', window.location.origin)
    url.searchParams.set('category', category)
    url.searchParams.set('interval', interval)
    url.searchParams.set('limit', limit.toString())

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error('Failed to fetch trending tokens')
    }

    const data: JupiterTokenV2[] = await response.json()

    if (!Array.isArray(data)) {
      return []
    }

    return data
      .filter(
        (token) =>
          token &&
          typeof token.id === 'string' &&
          typeof token.symbol === 'string'
      )
      .map(mapJupiterTokenToResult)
  } catch (error) {
    console.error('Error fetching trending tokens:', error)
    return []
  }
}

// Legacy exports for backward compatibility
export const searchTokensByAddress = async (
  address: string
): Promise<ITokenSearchResult | null> => {
  const results = await searchTokensByQuery(address)
  return results.length > 0 ? results[0] : null
}

export const searchTokensByKeyword = async (
  query: string,
  _verifiedOnly: boolean
): Promise<ITokenSearchResult[]> => {
  return searchTokensByQuery(query)
}
