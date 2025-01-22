'use client'
import PortfolioTabs from '@/app/portfolio/[address]/PortfolioTabs'
import { ProfileSection } from '../ProfileSection'
import { PortfolioBalanceSection } from '../tokens/SolBalanceSection'
import { TradingStats } from '../trading/TradingStats'
import { TapestryPromoSection } from '../tapestry/TapestryPromoSection'
import { TransactionSection } from '../TransactionSection'
import { useEffect, useState } from 'react'
import { TokenPortfolioResponse } from '@/types/Token'
import { WalletFollowButton } from '../profile/wallet-follow-button'

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
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-mono text-green-500">Wallet: {address}</h1>
        <WalletFollowButton walletAddress={address} size="lg" />
      </div>

      {/* Top section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Profile Section */}
        <div className="lg:w-1/2">
          <ProfileSection
            walletAddress={address}
            isLoadingProfileData={isLoading}
            hasSearched={true}
          />
        </div>

        {/* Right side - Balance and Trading Stats */}
        <div className="lg:w-1/2 flex flex-col space-y-3 h-[400px] lg:h-[600px]">
          <div className="h-[calc(33.33%-0.5rem)]">
            <PortfolioBalanceSection
              hideTitle={false}
              isLoading={isLoading}
              error={error || undefined}
              portfolioData={portfolioData}
            />
          </div>
          <div className="h-[calc(33.33%-0.5rem)]">
            <TradingStats walletAddress={address} hideTitle={false} />
          </div>
          <div className="h-[calc(33.33%-0.5rem)]">
            <TapestryPromoSection hideTitle={false} />
          </div>
        </div>
      </div>

      {/* Middle - Portfolio Tabs */}
      <div className="mt-6">
        <PortfolioTabs address={address} />
      </div>

      {/* Bottom - Transaction Section */}
      <div className="mt-6">
        <TransactionSection walletAddress={address} hasSearched={true} />
      </div>
    </div>
  )
}
