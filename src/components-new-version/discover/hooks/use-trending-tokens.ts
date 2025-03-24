import { ITrendingToken } from '@/components-new-version/models/token.models'
import { useEffect, useState } from 'react'

export const useTrendingTokens = () => {
  const [tokens, setTokens] = useState<ITrendingToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mockTrendingTokens = [
    {
      address: 'So11111111111111111111111111111111111111112',
      symbol: 'SOL',
      name: 'Solana',
      price: 105.25,
      volume24hUSD: 15000000,
      liquidity: 75000000,
      logoURI: 'https://cryptologos.cc/logos/solana-sol-logo.png',
      decimals: 9,
      rank: 1,
    },
    {
      address: 'USDc111111111111111111111111111111111111111',
      symbol: 'USDC',
      name: 'USD Coin',
      price: 1.0,
      volume24hUSD: 8500000,
      liquidity: 98000000,
      logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      decimals: 6,
      rank: 2,
    },
    {
      address: 'bonk111111111111111111111111111111111111111',
      symbol: 'BONK',
      name: 'Bonk',
      price: 0.000013,
      volume24hUSD: 3200000,
      liquidity: 16000000,
      logoURI: 'https://cryptologos.cc/logos/pepe-pepe-logo.png',
      decimals: 5,
      rank: 3,
    },
    {
      address: 'jito111111111111111111111111111111111111111',
      symbol: 'JTO',
      name: 'Jito',
      price: 2.5,
      volume24hUSD: 4200000,
      liquidity: 21000000,
      logoURI: 'https://cryptologos.cc/logos/pepe-pepe-logo.png',
      decimals: 6,
      rank: 4,
    },
    {
      address: 'meme111111111111111111111111111111111111111',
      symbol: 'MEME',
      name: 'MemeCoin',
      price: 0.007,
      volume24hUSD: 1900000,
      liquidity: 9000000,
      logoURI: 'https://cryptologos.cc/logos/pepe-pepe-logo.png',
      decimals: 6,
      rank: 5,
    },
  ]

  useEffect(() => {
    const fetchTrendingTokens = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(
          `https://public-api.birdeye.so/defi/token_trending?sort_by=volume24hUSD&sort_type=desc&offset=0&limit=20`,
          {
            method: 'GET',
            headers: {
              accept: 'application/json',
              'x-chain': 'solana',
              'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '',
            },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch trending tokens')
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error('API request failed')
        }

        setTokens(data.data.tokens)
      } catch (err) {
        console.error('Error fetching trending tokens:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    setTokens(mockTrendingTokens)

    fetchTrendingTokens()
  }, [])

  return { tokens, isLoading, error }
}
