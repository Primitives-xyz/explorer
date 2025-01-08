'use client'
import PortfolioTabs from '@/app/portfolio/[address]/PortfolioTabs'
import { ProfileSection } from '../ProfileSection'
import { PortfolioBalanceSection } from '../tokens/SolBalanceSection'
import { TradingStats } from '../trading/TradingStats'
import { useEffect, useState } from 'react'
import { TokenPortfolioResponse } from '@/types/Token'

interface TokenData {
  nativeBalance: {
    lamports: number
    price_per_sol: number
    total_price: number
  }
}

/**
 * Renders a wallet view with portfolio tabs
 */
export function WalletView({ address }: { address: string }) {
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [portfolioData, setPortfolioData] = useState<
    TokenPortfolioResponse | undefined
  >(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return

      setIsLoading(true)
      setError(null)

      try {
        // Fetch token data
        const tokenResponse = await fetch(
          `/api/tokens?address=${address}&type=all`,
        )
        if (!tokenResponse.ok) {
          throw new Error(`HTTP error! status: ${tokenResponse.status}`)
        }
        const tokenResult = await tokenResponse.json()
        if ('error' in tokenResult) {
          throw new Error(tokenResult.error)
        }
        setTokenData(tokenResult)

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
          `https://public-api.birdeye.so/v1/wallet/token_list?wallet=${address}`,
          portfolioOptions,
        )
        if (!portfolioResponse.ok) {
          throw new Error(
            `Portfolio HTTP error! status: ${portfolioResponse.status}`,
          )
        }
        const portfolioResult = await portfolioResponse.json()
        setPortfolioData(portfolioResult)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(
          error instanceof Error ? error.message : 'Failed to fetch data',
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [address])

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-mono text-green-500 mb-8">
        Wallet: {address}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PortfolioBalanceSection
          hideTitle={false}
          isLoading={isLoading}
          error={error || undefined}
          portfolioData={portfolioData}
        />
        <TradingStats walletAddress={address} hideTitle={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[600px]">
        <div className="lg:col-span-4 h-full">
          <div className="h-full">
            <ProfileSection walletAddress={address} />
          </div>
        </div>
        <div className="lg:col-span-8 h-full overflow-auto">
          <div className="h-full">
            <PortfolioTabs address={address} />
          </div>
        </div>
      </div>
    </div>
  )
}
