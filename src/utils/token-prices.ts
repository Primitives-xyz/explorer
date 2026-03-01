// Utility to fetch current token prices from Jupiter Price API v3
const JUPITER_PRICE_API = 'https://api.jup.ag/price/v3'
const JUPITER_API_KEY = process.env.JUPITER_API_KEY || ''

interface JupiterPriceV3Response {
  data: {
    [mint: string]: {
      id: string
      type: string
      price: string
      extraInfo?: {
        lastSwappedPrice?: {
          lastJupiterSellAt: number
          lastJupiterSellPrice: string
          lastJupiterBuyAt: number
          lastJupiterBuyPrice: string
        }
        quotedPrice?: {
          buyPrice: string
          buyAt: number
          sellPrice: string
          sellAt: number
        }
      }
    }
  }
  timeTaken: number
}

// Cache prices for 5 minutes
const priceCache = new Map<string, { price: number; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (JUPITER_API_KEY) {
    headers['x-api-key'] = JUPITER_API_KEY
  }
  return headers
}

export async function getCurrentTokenPrice(
  mint: string
): Promise<number | null> {
  // Check cache first
  const cached = priceCache.get(mint)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price
  }

  try {
    const response = await fetch(`${JUPITER_PRICE_API}?ids=${mint}`, {
      headers: getHeaders(),
    })
    if (!response.ok) {
      console.error('Failed to fetch price from Jupiter:', response.statusText)
      return null
    }

    const data: JupiterPriceV3Response = await response.json()
    const priceData = data.data[mint]

    if (!priceData) {
      return null
    }

    const price = Number(priceData.price)

    if (isNaN(price) || price <= 0) {
      return null
    }

    // Cache the price
    priceCache.set(mint, { price, timestamp: Date.now() })

    return price
  } catch (error) {
    console.error('Error fetching token price:', error)
    return null
  }
}

// Batch fetch prices for multiple tokens
export async function getCurrentTokenPrices(
  mints: string[]
): Promise<Map<string, number>> {
  const prices = new Map<string, number>()

  // Filter out mints we already have cached
  const uncachedMints = mints.filter((mint) => {
    const cached = priceCache.get(mint)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      prices.set(mint, cached.price)
      return false
    }
    return true
  })

  if (uncachedMints.length === 0) {
    return prices
  }

  try {
    // Jupiter Price API v3 allows up to 50 tokens per request
    const chunks = []
    for (let i = 0; i < uncachedMints.length; i += 50) {
      chunks.push(uncachedMints.slice(i, i + 50))
    }

    await Promise.all(
      chunks.map(async (chunk) => {
        const response = await fetch(
          `${JUPITER_PRICE_API}?ids=${chunk.join(',')}`,
          { headers: getHeaders() }
        )
        if (!response.ok) return

        const data: JupiterPriceV3Response = await response.json()

        Object.entries(data.data).forEach(([mint, priceData]) => {
          const price = Number(priceData.price)
          if (!isNaN(price) && price > 0) {
            prices.set(mint, price)
            priceCache.set(mint, {
              price,
              timestamp: Date.now(),
            })
          }
        })
      })
    )
  } catch (error) {
    console.error('Error batch fetching token prices:', error)
  }

  return prices
}
