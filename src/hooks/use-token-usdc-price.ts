import { useEffect, useState } from 'react'

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const SOL_MINT = 'So11111111111111111111111111111111111111112'
const CACHE_DURATION_MS = 25000 // 25 seconds

// Cache structure outside the hook to persist between renders
interface PriceCache {
  price: number
  timestamp: number
}

const priceCache: Record<string, PriceCache> = {}

export function useTokenUSDCPrice(tokenMint: string | undefined | null, decimals: number = 6) {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tokenMint) {
      setPrice(null)
      setLoading(false)
      setError(null)
      return
    }

    // Only fetch prices for SOL and USDC
    if (tokenMint !== SOL_MINT && tokenMint !== USDC_MINT) {
      setPrice(null)
      setLoading(false)
      setError(null)
      return
    }

    console.log(`Setting up price fetch for ${tokenMint} with ${decimals} decimals`)

    let isMounted = true
    const fetchTokenPrice = async () => {
      try {
        // Special case for USDC - always worth $1
        if (tokenMint === USDC_MINT) {
          if (isMounted) {
            setPrice(1)
            setError(null)
          }
          return
        }

        // Check cache first
        const cached = priceCache[tokenMint]
        const now = Date.now()
        if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
          console.log(`Using cached price for ${tokenMint}:`, cached.price)
          if (isMounted) {
            setPrice(cached.price)
            setError(null)
          }
          return
        }

        if (isMounted) {
          setLoading(true)
          setError(null)
        }

        // Use our backend endpoint to get the token/USDC price
        // We'll request a quote for 1 token to USDC
        const amount = Math.pow(10, decimals || 6) // 1 token in base units
        const url = `/api/jupiter/quote?inputMint=${tokenMint}&outputMint=${USDC_MINT}&amount=${amount}&slippageBps=50`
        console.log(`Fetching price from: ${url}`)

        const response = await fetch(url)
        if (!response.ok) {
          const errorData = await response.json()
          console.error(`HTTP error fetching price for ${tokenMint}:`, {
            status: response.status,
            error: errorData
          })
          throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`)
        }

        const data = await response.json()
        console.log(`Raw Jupiter response for ${tokenMint}:`, data)

        if (data.error) {
          console.error(`Jupiter API error for ${tokenMint}:`, data.error)
          throw new Error(data.error)
        }

        if (!data.outAmount) {
          console.error(`No outAmount in Jupiter response for ${tokenMint}:`, data)
          throw new Error('No price data received')
        }

        // Calculate price in USDC per token
        const outAmount = Number(data.outAmount) / Math.pow(10, 6) // USDC has 6 decimals

        // Validate the price
        if (isNaN(outAmount) || outAmount <= 0) {
          console.error(`Invalid price for ${tokenMint}:`, { outAmount, data })
          throw new Error('Invalid token price received')
        }

        console.log(`Fetched new price for ${tokenMint}:`, {
          outAmount,
          rawOutAmount: data.outAmount,
          inputDecimals: decimals,
          route: data.routePlan?.map((step: any) => step.swapInfo.label).join(' → ')
        })

        // Update cache
        priceCache[tokenMint] = {
          price: outAmount,
          timestamp: now,
        }

        if (isMounted) {
          setPrice(outAmount)
          setError(null)
        }
      } catch (err) {
        console.error(`Failed to fetch price for ${tokenMint}:`, err)
        // Keep using cached price if available, even if it's expired
        const cached = priceCache[tokenMint]
        if (cached && isMounted) {
          console.log(`Using expired cached price for ${tokenMint}:`, cached.price)
          setPrice(cached.price)
          setError('Using cached price')
        } else if (isMounted) {
          setPrice(null)
          setError(err instanceof Error ? err.message : 'Failed to fetch token price')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchTokenPrice()
    // Refresh price every 25 seconds
    const interval = setInterval(fetchTokenPrice, CACHE_DURATION_MS)
    
    // Cleanup function
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [tokenMint, decimals])

  return { price, loading, error }
} 