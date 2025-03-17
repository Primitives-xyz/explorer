'use client'

import PortfolioTabs from '@/components/portfolio/portfolio-tabs'
import { useIdentities } from '@/hooks/use-identities'
import { usePortfolioData } from '@/hooks/usePortfolioData'
import { useTranslations } from 'next-intl'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { ProfileSection } from '../profile-section'
import { WalletFollowButton } from '../profile/wallet-follow-button'
import { TapestryPromoSection } from '../tapestry/tapestry-promo-section'
import { PortfolioBalanceSection } from '../tokens/sol-balance-section'
import { TradingStats } from '../trading/trading-stats'
import { TransactionSection } from '../transaction-section'

/**
 * Renders a wallet view with portfolio tabs
 */

export function WalletView({ address }: { address: string }) {
  const { walletAddress } = useCurrentWallet()
  const { portfolioData, isLoading, error } = usePortfolioData(address)
  const {
    identities,
    loading: isLoadingIdentities,
    error: identitiesError,
  } = useIdentities(address)
  const t = useTranslations()

  // Show error state if wallet address is invalid
  if (error === t('error.invalid_solana_wallet_address')) {
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
            profileData={{
              profiles:
                !identitiesError && !isLoadingIdentities && identities
                  ? identities
                  : [],
            }}
            hasSearched={true}
          />
        </div>

        {/* Right side - Balance and Trading Stats */}
        <div className="lg:w-1/2 flex flex-col space-y-3">
          <div className="lg:h-[calc(33.33%-0.5rem)]">
            <PortfolioBalanceSection
              hideTitle={false}
              isLoading={isLoading}
              error={error}
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
