'use client'

import { TokenChart } from '@/components/tokens/token-details/token-chart'
import { TokenDetailsTabs } from '@/components/tokens/token-details/token-details-tabs'
import { TokenHeader } from '@/components/tokens/token-details/token-header'
import { TokenMetrics } from '@/components/tokens/token-details/token-metrics'
import { TokenSwapSection } from '@/components/tokens/token-details/token-swap-section'
import { TransactionSection } from '@/components/transaction-section'
import { useBirdeyeTokenOverview } from '@/hooks/use-birdeye-token-overview'
import type { FungibleTokenDetailsProps } from '@/utils/helius/types'

// Define the people in common data type
interface PeopleInCommonData {
  topUsers: Array<{ username: string; image: string }>
  totalAmount: number
  isLoading: boolean
}

// Create a new type that combines the original token info with people in common data
type EnhancedTokenInfo = FungibleTokenDetailsProps['tokenInfo'] & {
  peopleInCommon?: PeopleInCommonData
}

// Create the enhanced props type
interface EnhancedFungibleTokenDetailsProps {
  id: string
  tokenInfo: EnhancedTokenInfo
}

export default function FungibleTokenDetails({
  id,
  tokenInfo,
}: EnhancedFungibleTokenDetailsProps) {
  const { overview, isLoading } = useBirdeyeTokenOverview(id)

  const imageUrl =
    overview?.logoURI ||
    tokenInfo.content?.links?.image ||
    tokenInfo.content?.files?.[0]?.uri

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden bg-[#111111]">
      {/* Token Header and Key Metrics */}
      <div className="p-3 sm:p-4 border-b border-green-800/20">
        {/* Token Header and Metrics Layout */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
          <TokenHeader
            id={id}
            name={tokenInfo.content.metadata.name}
            symbol={tokenInfo.content.metadata.symbol}
            imageUrl={imageUrl || '/fallback-token.png'}
            website={overview?.extensions?.website}
            twitter={overview?.extensions?.twitter}
            peopleInCommon={tokenInfo.peopleInCommon}
          />

          {/* Key Metrics */}
          <TokenMetrics
            price={overview?.price}
            priceChange24h={overview?.priceChange24hPercent}
            liquidity={overview?.liquidity}
            volume24h={overview?.v24hUSD}
            marketCap={
              overview?.price
                ? overview.price * (overview.supply || 0)
                : undefined
            }
            holders={overview?.holder}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-2 sm:p-4">
        {/* Left Column - Chart */}
        <div className="lg:col-span-2">
          <TokenChart tokenId={id} />

          {/* <div className="text-lg font-mono mb-3 mt-4 text-gray-300">
            Market Activity
          </div> */}

          {/* Market Activity Cards
          {!isLoading && overview ? (
            <TokenMarketActivity overview={overview} isLoading={isLoading} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <Skeleton className="h-20 sm:h-24 w-full bg-green-900/20 col-span-2 md:col-span-1" />
              <Skeleton className="h-20 sm:h-24 w-full bg-green-900/20" />
              <Skeleton className="h-20 sm:h-24 w-full bg-green-900/20" />
              <Skeleton className="h-20 sm:h-24 w-full bg-green-900/20" />
            </div>
          )} */}

          <div className="text-lg font-mono my-4 text-gray-300">
            Token Details
          </div>

          {/* Token Details Tabs */}
          <TokenDetailsTabs
            id={id}
            overview={overview}
            isLoading={isLoading}
            decimals={tokenInfo.token_info.decimals}
            tokenProgram={tokenInfo.token_info.token_program}
            authorities={tokenInfo.authorities}
            description={
              overview?.extensions?.description ||
              tokenInfo.content.metadata.description
            }
            totalSupply={overview?.supply}
          />
        </div>

        {/* Right Column - Swap & Transactions */}
        <div className="lg:col-span-1">
          <div className="text-lg font-mono mb-4 text-gray-300">Swap</div>

          {/* Swap Section */}
          <TokenSwapSection
            tokenId={id}
            tokenSymbol={tokenInfo.content.metadata.symbol}
            inputDecimals={9}
          />

          <div className="text-lg font-mono mb-4 mt-6 text-gray-300">
            Transaction History
          </div>

          {/* Transaction History */}
          <div className="bg-black/40 border border-green-800/40 rounded-xl overflow-hidden">
            <TransactionSection walletAddress={id} hasSearched={true} />
          </div>
        </div>
      </div>
    </div>
  )
}
