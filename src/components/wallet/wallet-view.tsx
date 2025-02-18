'use client'

import PortfolioTabs from '@/components/portfolio/portfolio-tabs'
import type { TokenPortfolioResponse } from '@/types/Token'
import { isValidSolanaAddress } from '@/utils/validation'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { ProfileSection } from '../profile-section'
import { WalletFollowButton } from '../profile/wallet-follow-button'
import { TapestryPromoSection } from '../tapestry/tapestry-promo-section'
import { PortfolioBalanceSection } from '../tokens/sol-balance-section'
import { TradingStats } from '../trading/trading-stats'
import { TransactionSection } from '../transaction-section'

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
  const [_tokenData, setTokenData] = useState<TokenData | null>(null)
  const { walletAddress } = useCurrentWallet()
  const [portfolioData, setPortfolioData] = useState<
    TokenPortfolioResponse | undefined
  >(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const t = useTranslations()

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return

      // Validate wallet address before making any API calls
      if (!isValidSolanaAddress(address)) {
        setError(t('error.invalid_solana_wallet_address'))
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Fetch token data
        const tokenResponse = await fetch(
          `/api/tokens?address=${address}&type=all`
        )
        if (!tokenResponse.ok) {
          throw new Error(
            `${t('error.http_error_status')}: ${tokenResponse.status}`
          )
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
      } catch (error) {
        console.error(t('error.failed_to_fetch_data'), error)
        setError(
          error instanceof Error
            ? error.message
            : t('error.failed_to_fetch_data')
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [address])

  // Show error state if wallet address is invalid
  if (error === 'Invalid Solana wallet address') {
    return (
      <div className="px-4 py-8">
        <div className="text-red-500 font-mono">
          {t('error.invalid_wallet_address')}: {address}
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 className="text-xl sm:text-2xl font-mono break-all">
          {t('common.wallet')}: {address}
        </h1>
        {walletAddress !== address && (
          <WalletFollowButton walletAddress={address} size="lg" />
        )}
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
        <div className="lg:w-1/2 flex flex-col space-y-3">
          <div className="lg:h-[calc(33.33%-0.5rem)]">
            <PortfolioBalanceSection
              hideTitle={false}
              isLoading={isLoading}
              error={error || undefined}
              portfolioData={portfolioData}
            />
          </div>
          <div className=" lg:h-[calc(33.33%-0.5rem)]">
            <TradingStats walletAddress={address} hideTitle={false} />
          </div>
          <div className=" lg:h-[calc(33.33%-0.5rem)]">
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
