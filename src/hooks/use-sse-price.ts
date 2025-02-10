import { useState, useEffect } from 'react'
import { SSE_TOKEN_MINT } from '@/constants/jupiter'

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const SSE_DECIMALS = 6
const USDC_DECIMALS = 6
const CACHE_DURATION_MS = 25000 // 25 seconds

// Cache structure outside the hook to persist between renders
interface PriceCache {
  price: number
  timestamp: number
}
let ssePriceCache: PriceCache | null = null

export function useSSEPrice() {
  const [ssePrice, setSsePrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSSEPrice = async () => {
      try {
        // Check cache first
        const now = Date.now()
        if (
          ssePriceCache &&
          now - ssePriceCache.timestamp < CACHE_DURATION_MS
        ) {
          console.log('Using cached SSE price:', ssePriceCache.price)
          setSsePrice(ssePriceCache.price)
          return
        }

        setLoading(true)
        setError(null)

        // Use Jupiter quote API to get the SSE/USDC price
        // We'll request a quote for 1 SSE to USDC
        const amount = Math.pow(10, SSE_DECIMALS) // 1 SSE in base units
        const response = await fetch(
          `https://quote-api.jup.ag/v6/quote?inputMint=${SSE_TOKEN_MINT}` +
            `&outputMint=${USDC_MINT}&amount=${amount}` +
            `&slippageBps=50`,
        ).then((res) => res.json())

        if (response.error) {
          throw new Error(response.error)
        }

        // Calculate price in USDC per SSE
        const outAmount =
          Number(response.outAmount) / Math.pow(10, USDC_DECIMALS)

        // Validate the price
        if (isNaN(outAmount) || outAmount <= 0) {
          throw new Error('Invalid SSE price received')
        }

        console.log('Fetched new SSE/USDC Price:', {
          outAmount,
          rawOutAmount: response.outAmount,
          route: response.routePlan
            ?.map((step: any) => step.swapInfo.label)
            .join(' → '),
        })

        // Update cache
        ssePriceCache = {
          price: outAmount,
          timestamp: now,
        }

        setSsePrice(outAmount)
      } catch (err) {
        console.error('Failed to fetch SSE price:', err)
        setError('Failed to fetch SSE price')
        setSsePrice(null)
        ssePriceCache = null
      } finally {
        setLoading(false)
      }
    }

    fetchSSEPrice()
    // Refresh price every 25 seconds
    const interval = setInterval(fetchSSEPrice, CACHE_DURATION_MS)

    return () => clearInterval(interval)
  }, [])

  return { ssePrice, loading, error }
}
