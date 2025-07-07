// Historical price lookup utility
// This could be enhanced to fetch from real price APIs like CoinGecko, Birdeye, etc.

interface PriceData {
  [mint: string]: {
    symbol: string
    avgPrice2025?: number // Average price in 2025
    priceRanges?: {
      [yearMonth: string]: { min: number; max: number; avg: number }
    }
  }
}

// Conservative price estimates for major tokens
// In production, these would come from a price API
const HISTORICAL_PRICES: PriceData = {
  So11111111111111111111111111111111111111112: {
    symbol: 'SOL',
    avgPrice2025: 225,
    priceRanges: {
      '2025-02': { min: 200, max: 250, avg: 225 },
      '2025-01': { min: 180, max: 220, avg: 200 },
    },
  },
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
    symbol: 'USDC',
    avgPrice2025: 1,
  },
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: {
    symbol: 'USDT',
    avgPrice2025: 1,
  },
  H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump: {
    symbol: 'SSE',
    avgPrice2025: 0.00782, // From your current SSE/USDC price
  },
}

export async function getHistoricalPrice(
  mint: string,
  timestamp: number | string
): Promise<number | null> {
  // Check if we have data for this token
  const priceData = HISTORICAL_PRICES[mint]
  if (!priceData) return null

  // For stablecoins, always return 1
  if (priceData.symbol === 'USDC' || priceData.symbol === 'USDT') {
    return 1
  }

  // If we have date-specific ranges, use them
  if (priceData.priceRanges && timestamp) {
    const date = new Date(Number(timestamp))
    const yearMonth = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`

    const range = priceData.priceRanges[yearMonth]
    if (range) {
      return range.avg
    }
  }

  // Fall back to average 2025 price
  return priceData.avgPrice2025 || null
}

// In production, this would call a real API
export async function fetchHistoricalPriceFromAPI(
  mint: string,
  timestamp: number
): Promise<number | null> {
  // First try our static historical data
  const historicalPrice = await getHistoricalPrice(mint, timestamp)
  if (historicalPrice !== null) return historicalPrice

  // If no historical data, try to get current price as fallback
  try {
    const { getCurrentTokenPrice } = await import('./token-prices')
    const currentPrice = await getCurrentTokenPrice(mint)

    if (currentPrice !== null) {
      console.log(`Using current price for ${mint}: $${currentPrice}`)
      return currentPrice
    }
  } catch (error) {
    console.error('Error fetching current price as fallback:', error)
  }

  return null
}

// Batch fetch prices for multiple tokens
export async function getHistoricalPrices(
  tokens: Array<{ mint: string; timestamp: number | string }>
): Promise<Map<string, number>> {
  const prices = new Map<string, number>()

  await Promise.all(
    tokens.map(async ({ mint, timestamp }) => {
      const price = await getHistoricalPrice(mint, timestamp)
      if (price !== null) {
        prices.set(mint, price)
      }
    })
  )

  return prices
}
