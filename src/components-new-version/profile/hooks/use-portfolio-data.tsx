import {
  TokenPortfolioItem,
  TokenPortfolioResponse,
} from '@/components-new-version/models/token.models'
import { isValidSolanaAddress } from '@/components-new-version/utils/validation'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

interface UsePortfolioDataResult {
  portfolioData?: TokenPortfolioResponse
  isLoading: boolean
  error?: string
  refetch: () => void
  tokenData?: TokenData | null
  items: TokenPortfolioItem[]
}

interface TokenData {
  nativeBalance: {
    lamports: number
    price_per_sol: number
    total_price: number
  }
}

export function usePortfolioData({
  walletAddress,
}: {
  walletAddress?: string
}): UsePortfolioDataResult {
  const [portfolioData, setPortfolioData] = useState<
    TokenPortfolioResponse | undefined
  >()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [refreshCounter, setRefreshCounter] = useState(0)
  const t = useTranslations()

  useEffect(() => {
    if (!walletAddress) {
      setPortfolioData(undefined)
      setError(undefined)
      setIsLoading(false)
      return
    }

    // Validate wallet address before making any API calls
    if (!isValidSolanaAddress(walletAddress)) {
      setError(t('error.invalid_solana_wallet_address'))
      setIsLoading(false)
      return
    }

    const fetchPortfolioData = async () => {
      setIsLoading(true)
      setError(undefined)

      try {
        // Fetch portfolio data
        const portfolioOptions = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            'x-chain': 'solana',
            'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '',
          },
        }

        const portfolioResponse = await fetch(
          `https://public-api.birdeye.so/v1/wallet/token_list?wallet=${walletAddress}`,
          portfolioOptions
        )
        if (!portfolioResponse.ok) {
          throw new Error(
            `${t('error.portfolio_http_error_status')}: ${
              portfolioResponse.status
            }`
          )
        }
        const portfolioResult = await portfolioResponse.json()
        setPortfolioData(portfolioResult)
      } catch (err) {
        console.error(t('error.failed_to_fetch_data'), err)
        setError(
          err instanceof Error ? err.message : t('error.failed_to_fetch_data')
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchPortfolioData()
  }, [walletAddress, refreshCounter, t])

  const refetch = () => {
    setRefreshCounter((prev) => prev + 1)
  }

  return {
    portfolioData,
    isLoading,
    error,
    refetch,
    items: portfolioData?.data.items || [],
  }
}
