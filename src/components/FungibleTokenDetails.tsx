'use client'

import { formatNumber } from '@/utils/format'
import type { FungibleTokenDetailsProps } from '@/utils/helius/types'
import Image from 'next/image'
import { TransactionSection } from './TransactionSection'
import { JupiterSwapForm } from './transactions/jupiter-swap-form'
import { Tab } from '@headlessui/react'
import { Avatar } from './common/Avatar'

export default function FungibleTokenDetails({
  id,
  tokenInfo,
}: FungibleTokenDetailsProps) {
  const imageUrl =
    tokenInfo.content?.links?.image || tokenInfo.content?.files?.[0]?.uri
  const supply =
    tokenInfo.token_info.supply / Math.pow(10, tokenInfo.token_info.decimals)
  const marketCap =
    supply * (tokenInfo.token_info.price_info?.price_per_token || 0)

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
                  <div className="flex items-center gap-3">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={`Token ${tokenInfo.content.metadata.name}`}
                        width={48}
                        height={48}
                        className="rounded-full border border-green-500"
                      />
                    ) : (
                      <Avatar username={tokenInfo.content.metadata.name} size={48} />
                    )}
                    <h1 className="text-4xl font-bold text-green-500 font-mono">
                      {tokenInfo.content.metadata.name}
                    </h1>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 font-mono">
                      ${tokenInfo.content.metadata.symbol}
                    </span>
                    <span className="text-xs px-3 py-1 bg-green-900/30 rounded-full text-green-400/80 font-mono">
                      {tokenInfo.interface}
                    </span>
                  </div>
                </div>

                <p className="text-green-400/70 max-w-2xl">
                  {tokenInfo.content.metadata.description}
                </p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-green-800/40">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-green-500/5 border border-green-500/10 group-hover:border-green-500/20 transition-colors">
                  <span className="text-2xl text-green-500">$</span>
                </div>
                <div>
                  <h3 className="text-green-500/60 text-sm font-mono">Price</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-green-400 font-mono group-hover:text-green-300 transition-colors">
                      $
                      {formatNumber(
                        tokenInfo.token_info.price_info?.price_per_token || 0,
                        4,
                      )}
                    </span>
                    <span className="text-green-500/60 text-sm">
                      {tokenInfo.token_info.price_info?.currency}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-green-500/5 border border-green-500/10 group-hover:border-green-500/20 transition-colors">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-green-500/60 text-sm font-mono">
                    Market Cap
                  </h3>
                  <div className="text-2xl font-bold text-green-400 font-mono group-hover:text-green-300 transition-colors">
                    ${formatNumber(marketCap)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-green-500/5 border border-green-500/10 group-hover:border-green-500/20 transition-colors">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-green-500/60 text-sm font-mono">
                    Supply
                  </h3>
                  <div className="text-2xl font-bold text-green-400 font-mono group-hover:text-green-300 transition-colors">
                    {formatNumber(supply)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Swap and Token Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Swap Section */}
          <div className="flex flex-col">
            <h3 className="text-xl font-mono text-green-500 mb-4">Swap</h3>
            <div className="flex-1 bg-black/40 border border-green-800/40 rounded-xl overflow-hidden">
              <Tab.Group className="h-full flex flex-col">
                <Tab.List className="flex space-x-1 border-b border-green-800/40">
                  <Tab
                    className={({ selected }: { selected: boolean }) =>
                      `flex-1 px-6 py-4 text-lg font-mono outline-none ${
                        selected
                          ? 'text-green-500 bg-green-900/20'
                          : 'text-green-500/60 hover:text-green-500/80 hover:bg-green-900/10'
                      } transition-colors`
                    }
                  >
                    Swap SOL
                  </Tab>
                  <Tab
                    className={({ selected }: { selected: boolean }) =>
                      `flex-1 px-6 py-4 text-lg font-mono outline-none ${
                        selected
                          ? 'text-green-500 bg-green-900/20'
                          : 'text-green-500/60 hover:text-green-500/80 hover:bg-green-900/10'
                      } transition-colors`
                    }
                  >
                    Swap USDC
                  </Tab>
                </Tab.List>
                <Tab.Panels className="flex-1 flex flex-col">
                  <Tab.Panel className="flex-1 flex flex-col h-full">
                    <div className="flex-1 p-6">
                      <JupiterSwapForm
                        initialInputMint="So11111111111111111111111111111111111111112"
                        initialOutputMint={id}
                        inputTokenName="SOL"
                        outputTokenName={tokenInfo.content.metadata.symbol}
                        inputDecimals={9}
                      />
                    </div>
                  </Tab.Panel>
                  <Tab.Panel className="flex-1 flex flex-col h-full">
                    <div className="flex-1 p-6">
                      <JupiterSwapForm
                        initialInputMint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
                        initialOutputMint={id}
                        inputTokenName="USDC"
                        outputTokenName={tokenInfo.content.metadata.symbol}
                        inputDecimals={6}
                      />
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>

          {/* Token Info Section */}
          <div className="flex flex-col">
            <h3 className="text-xl font-mono text-green-500 mb-4">
              Token Info
            </h3>
            <div className="flex-1 bg-black/40 border border-green-800/40 rounded-xl p-6 space-y-6">
              {/* Basic Token Info */}
              <div className="space-y-3">
                {[
                  { label: 'Token Address', value: id },
                  { label: 'Decimals', value: tokenInfo.token_info.decimals },
                  {
                    label: 'Token Program',
                    value: tokenInfo.token_info.token_program,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-green-500/60 text-sm">
                      {item.label}
                    </span>
                    <span className="font-mono text-green-400 break-all">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Authority Info */}
              <div className="pt-4 border-t border-green-800/40">
                <h4 className="text-lg font-mono text-green-500 mb-3">
                  Authority
                </h4>
                <div className="space-y-4">
                  {tokenInfo.authorities.map((authority, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex flex-col">
                        <span className="text-green-500/60 text-sm">
                          Address
                        </span>
                        <span className="font-mono text-green-400 break-all">
                          {authority.address}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-green-500/60 text-sm">
                          Scopes
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {authority.scopes.map((scope, j) => (
                            <span
                              key={j}
                              className="px-2 py-1 bg-green-500/10 rounded-md text-green-400 text-sm"
                            >
                              {scope}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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

        {/* End of component */}
      </div>
    </div>
  )
}
