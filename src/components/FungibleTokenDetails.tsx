'use client'

import { useBirdeyeTokenOverview } from '@/hooks/use-birdeye-token-overview'
import type { FungibleTokenDetailsProps } from '@/utils/helius/types'
import { Tab } from '@headlessui/react'
import {
  ChatBubbleLeftRightIcon as DiscordIcon,
  GlobeAltIcon,
  ArrowUpRightIcon as TwitterIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import { TransactionSection } from './TransactionSection'
import { PeopleInCommonSection } from './social/people-in-common/PeopleInCommonSection'
import { TokenInformation } from './tokens/TokenInformation'
import { TokenMetrics } from './tokens/TokenMetrics'
import { LargestHolders } from './tokens/largest-holders'
import { JupiterSwapForm } from './transactions/jupiter-swap-form'
import { Skeleton } from './ui/skeleton'

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
    <div className="w-full max-w-[100vw] overflow-x-hidden">
      <div className="container mx-auto px-2 md:px-8 py-8">
        {/* Hero Section with Token Identity */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent blur-3xl" />
          <div className="relative flex flex-col p-8 bg-black/40 border border-green-800 rounded-2xl backdrop-blur-sm">
            {/* Token Identity */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
              <div className="relative w-32 h-32 rounded-2xl border-2 border-green-500 overflow-hidden">
                <Image
                  src={imageUrl || '/fallback-token.png'}
                  alt={tokenInfo.content.metadata.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                  <h1 className="text-4xl font-bold text-green-500 font-mono">
                    {tokenInfo.content.metadata.name}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 font-mono">
                      ${tokenInfo.content.metadata.symbol}
                    </span>
                    <span className="text-xs px-3 py-1 bg-green-900/30 rounded-full text-green-400/80 font-mono">
                      {tokenInfo.interface}
                    </span>
                  </div>
                </div>

                <p className="text-green-400/70 max-w-2xl mb-4">
                  {overview?.extensions?.description ||
                    tokenInfo.content.metadata.description}
                </p>

                {overview && (
                  <div className="flex flex-wrap gap-4">
                    {overview.extensions?.website && (
                      <a
                        href={overview.extensions.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                      >
                        <GlobeAltIcon className="w-5 h-5" />
                        <span>Website</span>
                      </a>
                    )}
                    {overview.extensions?.discord && (
                      <a
                        href={overview.extensions.discord}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                      >
                        <DiscordIcon className="w-5 h-5" />
                        <span>Discord</span>
                      </a>
                    )}
                    {overview.extensions?.twitter && (
                      <a
                        href={overview.extensions.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                      >
                        <TwitterIcon className="w-5 h-5" />
                        <span>Twitter</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Token Metrics */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 bg-green-900/20" />
                ))}
              </div>
            ) : overview ? (
              <TokenMetrics overview={overview} />
            ) : null}

            {/* People in Common Section */}
            {tokenInfo.peopleInCommon?.isLoading ? (
              <div className="mt-6">
                <Skeleton className="h-12 bg-green-900/20" />
              </div>
            ) : tokenInfo.peopleInCommon?.topUsers &&
              tokenInfo.peopleInCommon.topUsers.length > 0 ? (
              <div className="mt-6">
                <PeopleInCommonSection
                  topUsers={tokenInfo.peopleInCommon.topUsers}
                  totalAmount={tokenInfo.peopleInCommon.totalAmount}
                  tokenName={tokenInfo.content.metadata.name}
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* Swap and Token Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Swap Section */}
          <div className="flex flex-col">
            <h3 className="text-xl font-mono text-green-500 mb-4">Swap</h3>
            <div className="flex flex-col h-[675px] bg-black/40 border border-green-800/40 rounded-xl overflow-hidden">
              <div className="h-full p-4">
                <div className="h-full overflow-y-auto">
                  <JupiterSwapForm
                    initialInputMint="So11111111111111111111111111111111111111112"
                    initialOutputMint={id}
                    initialAmount="0.01"
                    inputTokenName="SOL"
                    outputTokenName={tokenInfo.content.metadata.symbol}
                    inputDecimals={9}
                    sourceWallet=""
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Token Details Section */}
          <div className="flex flex-col">
            <h3 className="text-xl font-mono text-green-500 mb-4">
              Token Details
            </h3>
            <div className="flex flex-col h-[675px] bg-black/40 border border-green-800/40 rounded-xl overflow-hidden">
              <Tab.Group className="h-full flex flex-col">
                <Tab.List className="flex space-x-1 border-b border-green-800/40">
                  <Tab
                    className={({ selected }) =>
                      `flex-1 px-6 py-4 text-lg font-mono outline-none ${
                        selected
                          ? 'text-green-500 bg-green-900/20'
                          : 'text-green-500/60 hover:text-green-500/80 hover:bg-green-900/10'
                      } transition-colors`
                    }
                  >
                    About
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `flex-1 px-6 py-4 text-lg font-mono outline-none ${
                        selected
                          ? 'text-green-500 bg-green-900/20'
                          : 'text-green-500/60 hover:text-green-500/80 hover:bg-green-900/10'
                      } transition-colors`
                    }
                  >
                    Token Holders
                  </Tab>
                </Tab.List>
                <Tab.Panels className="flex-1 overflow-y-auto">
                  <Tab.Panel className="h-full p-4">
                    <div className="h-full overflow-y-auto">
                      <TokenInformation
                        id={id}
                        overview={overview}
                        decimals={tokenInfo.token_info.decimals}
                        tokenProgram={tokenInfo.token_info.token_program}
                        authorities={tokenInfo.authorities}
                      />
                    </div>
                  </Tab.Panel>
                  <Tab.Panel className="min-h-[500px]">
                    <div className="p-4">
                      <LargestHolders
                        mintAddress={id}
                        totalSupply={overview?.supply || 0}
                      />
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        </div>

        {/* Chart and Transaction History Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Birdeye Chart */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-mono text-green-500 mb-4">
              Price Chart
            </h3>
            <div className="w-full h-[600px] bg-black/40 border border-green-800/40 rounded-xl overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={`https://birdeye.so/tv-widget/${id}?chain=solana&viewMode=pair&chartInterval=15&chartType=CANDLE&theme=dark`}
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-mono text-green-500 mb-4">
              Transaction History
            </h3>
            <div className="h-[600px] overflow-y-auto">
              <TransactionSection walletAddress={id} hasSearched={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
