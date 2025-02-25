'use client'

import PortfolioTabs from '@/components/portfolio/portfolio-tabs'
import { useIdentities } from '@/hooks/use-identities'
import { useToast } from '@/hooks/use-toast'
import type { TokenPortfolioResponse } from '@/types/Token'
import { formatAddress, formatNumber } from '@/utils/format'
import { isValidSolanaAddress } from '@/utils/validation'
import { Copy, ExternalLink, Plus, Share2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { WalletFollowButton } from '../profile/wallet-follow-button'
import { TradingStats } from '../trading/trading-stats'
import { WalletProfileSection } from './wallet-profile-section'
import { WalletTransactionView } from './wallet-transaction-view'

interface TokenData {
  nativeBalance: {
    lamports: number
    price_per_sol: number
    total_price: number
  }
}

/**
 * Renders a terminal-inspired wallet view that matches market standards
 */
export function WalletView({ address }: { address: string }) {
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const { walletAddress } = useCurrentWallet()
  const [portfolioData, setPortfolioData] = useState<
    TokenPortfolioResponse | undefined
  >(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    identities,
    loading: isLoadingIdentities,
    error: identitiesError,
  } = useIdentities(address)
  const t = useTranslations()
  const { toast } = useToast()

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
      <div className="px-4 py-8 font-mono">
        <div className="text-red-500">
          {t('error.invalid_wallet_address')}: {address}
        </div>
      </div>
    )
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address)
    toast({
      title: t('common.address_copied'),
      variant: 'success',
    })
  }

  const handleShareWallet = () => {
    const url = `${window.location.origin}/wallet/${address}`
    navigator.clipboard.writeText(url)
    toast({
      title: t('common.wallet_link_copied') || t('success.link_copied'),
      variant: 'success',
    })
  }

  // Get SOL balance from portfolio data
  const solToken = portfolioData?.data?.items.find(
    (item) => item.symbol === 'SOL'
  )
  const solBalance = solToken?.uiAmount || 0
  const solValue = solToken?.valueUsd || 0

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden bg-[#111111] font-mono">
      {/* Wallet Header - Compact with essential info */}
      <div className="bg-black/30 p-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-green-400">{t('common.wallet')}:</span>
            <span className="text-white">{formatAddress(address, 8, 8)}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyAddress}
                className="text-green-400 hover:text-green-300 transition-colors"
                title={t('common.copy_address')}
              >
                <Copy size={14} />
              </button>
              <a
                href={`https://solscan.io/account/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 transition-colors"
                title={t('common.view_on_solscan')}
              >
                <ExternalLink size={14} />
              </a>
              <button
                onClick={handleShareWallet}
                className="text-green-400 hover:text-green-300 transition-colors"
                title={t('common.share_wallet')}
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {walletAddress === address ? (
              <div className="text-green-400 text-xs border border-green-500/20 bg-green-500/5 px-2 py-0.5 rounded">
                {t('common.your_wallet')}
              </div>
            ) : (
              <WalletFollowButton walletAddress={address} size="sm" />
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Streamlined Layout */}
      <div className="p-2 space-y-2">
        {/* Top Section: Stats/Profile and Transactions */}
        <div className="border border-green-800 bg-black/50 rounded-none">
          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Left Column - Stats & Social (3 cols) */}
            <div className="md:col-span-3 md:border-r border-green-800/30">
              {/* Quick Stats Panel */}
              <div className="p-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* SOL Balance */}
                  <div>
                    <div className="text-green-400 text-xs mb-1">
                      <span className="mr-1">{'>'}</span> SOL
                    </div>
                    {isLoading ? (
                      <div className="animate-pulse h-5 bg-green-800/20 rounded w-2/3"></div>
                    ) : (
                      <div className="text-base">
                        {formatNumber(solBalance)}
                      </div>
                    )}
                    {!isLoading && (
                      <div className="text-gray-400 text-xs">
                        ${formatNumber(solValue)}
                      </div>
                    )}
                  </div>

                  {/* Portfolio Value */}
                  <div>
                    <div className="text-green-400 text-xs mb-1">
                      <span className="mr-1">{'>'}</span>{' '}
                      {t('portfolio_balance.title')}
                    </div>
                    {isLoading ? (
                      <div className="animate-pulse h-5 bg-green-800/20 rounded w-2/3"></div>
                    ) : (
                      <div className="text-base">
                        ${formatNumber(portfolioData?.data?.totalUsd || 0)}
                      </div>
                    )}
                    {!isLoading && (
                      <div className="text-gray-400 text-xs">
                        {portfolioData?.data?.items.length || 0}{' '}
                        {t('common.tokens')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Trading Stats */}
              <div>
                <TradingStats walletAddress={address} hideTitle={true} />
              </div>

              {/* Profile Section */}
              <div>
                <WalletProfileSection
                  walletAddress={address}
                  isLoading={isLoadingIdentities}
                  profiles={
                    !identitiesError && !isLoadingIdentities && identities
                      ? identities
                      : []
                  }
                />
              </div>
            </div>

            {/* Right Column - Transactions (9 cols) */}
            <div className="md:col-span-9">
              <div className="h-full">
                <WalletTransactionView
                  walletAddress={address}
                  itemsPerPage={20}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Tokens and NFTs */}
        <div className="border border-green-800 bg-black/50 rounded-none">
          <PortfolioTabs address={address} compact={true} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6 z-10">
        <Link
          href={`https://jup.ag/swap/USDC-SOL?outputMint=So11111111111111111111111111111111111111112&recipient=${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full shadow-lg transition-colors"
          title={t('common.send_sol')}
        >
          <Plus size={20} className="text-black" />
        </Link>
      </div>
    </div>
  )
}
