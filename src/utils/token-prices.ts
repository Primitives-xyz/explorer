// Utility to fetch current token prices from Jupiter
const JUPITER_PRICE_API = 'https://price.jup.ag/v4'

interface JupiterPriceResponse {
  data: {
    [mint: string]: {
      id: string
      mintSymbol: string
      vsToken: string
      vsTokenSymbol: string
      price: number
    }
  }
  timeTaken: number
}

// Cache prices for 5 minutes
const priceCache = new Map<string, { price: number; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getCurrentTokenPrice(
  mint: string
): Promise<number | null> {
  // Check cache first
  const cached = priceCache.get(mint)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price
  }

  try {
    const response = await fetch(`${JUPITER_PRICE_API}/price?ids=${mint}`)
    if (!response.ok) {
      console.error('Failed to fetch price from Jupiter:', response.statusText)
      return null
    }

    const data: JupiterPriceResponse = await response.json()
    const priceData = data.data[mint]

    if (!priceData) {
      return null
    }

    const price = priceData.price

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
    // Jupiter allows up to 100 tokens per request
    const chunks = []
    for (let i = 0; i < uncachedMints.length; i += 100) {
      chunks.push(uncachedMints.slice(i, i + 100))
    }

    await Promise.all(
      chunks.map(async (chunk) => {
        const response = await fetch(
          `${JUPITER_PRICE_API}/price?ids=${chunk.join(',')}`
        )
        if (!response.ok) return

        const data: JupiterPriceResponse = await response.json()

        Object.entries(data.data).forEach(([mint, priceData]) => {
          prices.set(mint, priceData.price)
          priceCache.set(mint, {
            price: priceData.price,
            timestamp: Date.now(),
          })
        })
      })
    )
  } catch (error) {
    console.error('Error batch fetching token prices:', error)
  }

  return prices
}
