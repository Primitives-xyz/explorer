import type { TokenPortfolioResponse } from '@/types/Token'
import { useEffect, useState } from 'react'

interface UsePortfolioDataResult {
  portfolioData?: TokenPortfolioResponse
  isLoading: boolean
  error?: string
  refetch: () => void
}

/**
 * Hook to fetch portfolio data for a wallet address
 *
 * @param walletAddress The wallet address to fetch portfolio data for
 * @returns Object containing portfolio data, loading state, error, and refetch function
 */
export function usePortfolioData(
  walletAddress?: string
): UsePortfolioDataResult {
  const [portfolioData, setPortfolioData] = useState<
    TokenPortfolioResponse | undefined
  >()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [refreshCounter, setRefreshCounter] = useState(0)

  useEffect(() => {
    if (!walletAddress) {
      setPortfolioData(undefined)
      setError(undefined)
      setIsLoading(false)
      return
    }

    const fetchPortfolioData = async () => {
      setIsLoading(true)
      setError(undefined)

      try {
        // In a real application, this would be an API call
        // For now, we'll simulate a delay and return mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data - in a real app, this would be fetched from an API
        const mockData: TokenPortfolioResponse = {
          success: true,
          data: {
            wallet: walletAddress,
            totalUsd: 12920,
            items: [
              {
                address: 'So11111111111111111111111111111111111111112',
                name: 'Solana',
                symbol: 'SOL',
                decimals: 9,
                balance: '455000000',
                uiAmount: 0.455,
                chainId: '101',
                logoURI:
                  'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
                priceUsd: 143,
                valueUsd: 65.05,
              },
              // Add 112 tokens worth $12.85K total
              {
                address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                name: 'USD Coin',
                symbol: 'USDC',
                decimals: 6,
                balance: '5000000000',
                uiAmount: 5000,
                chainId: '101',
                logoURI:
                  'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
                priceUsd: 1,
                valueUsd: 5000,
              },
              {
                address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
                name: 'Marinade staked SOL',
                symbol: 'mSOL',
                decimals: 9,
                balance: '7000000000',
                uiAmount: 7,
                chainId: '101',
                logoURI:
                  'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
                priceUsd: 147.88,
                valueUsd: 1035.16,
              },
              // Add more tokens to simulate 112 tokens total
              // The rest are represented by this one entry for simplicity
              {
                address: 'other-tokens',
                name: 'Other Tokens',
                symbol: 'VARIOUS',
                decimals: 9,
                balance: '1000000000',
                uiAmount: 1,
                chainId: '101',
                logoURI: '',
                priceUsd: 6814.79,
                valueUsd: 6814.79,
              },
            ],
          },
        }

        setPortfolioData(mockData)
      } catch (err) {
        console.error('Error fetching portfolio data:', err)
        setError('Failed to fetch portfolio data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPortfolioData()
  }, [walletAddress, refreshCounter])

  const refetch = () => {
    setRefreshCounter((prev) => prev + 1)
  }

  return { portfolioData, isLoading, error, refetch }
}
