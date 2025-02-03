'use client'

import { formatNumber } from '@/utils/format'
import { FungibleTokenDetailsProps } from '@/utils/helius/types'
import Image from 'next/image'
import { TransactionSection } from './TransactionSection'
import { JupiterSwapForm } from './transactions/jupiter-swap-form'

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
    <div className="container mx-auto p-8">
      {/* Hero Section with Token Identity */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-center gap-8 p-8 bg-black/40 border border-green-800 rounded-2xl backdrop-blur-sm">
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

            <p className="text-green-400/70 max-w-2xl">
              {tokenInfo.content.metadata.description}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl hover:border-green-600/40 transition-all group">
          <h3 className="text-green-500/60 text-sm font-mono mb-2">
            Current Price
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-green-400 font-mono group-hover:text-green-300 transition-colors">
              $
              {formatNumber(
                tokenInfo.token_info.price_info?.price_per_token || 0,
                4,
              )}
            </span>
            <span className="text-green-500/60">
              {tokenInfo.token_info.price_info?.currency}
            </span>
          </div>
        </div>

        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl hover:border-green-600/40 transition-all group">
          <h3 className="text-green-500/60 text-sm font-mono mb-2">
            Market Cap
          </h3>
          <div className="text-3xl font-bold text-green-400 font-mono group-hover:text-green-300 transition-colors">
            ${formatNumber(marketCap)}
          </div>
        </div>

        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl hover:border-green-600/40 transition-all group">
          <h3 className="text-green-500/60 text-sm font-mono mb-2">
            Total Supply
          </h3>
          <div className="text-3xl font-bold text-green-400 font-mono group-hover:text-green-300 transition-colors">
            {formatNumber(supply)}
          </div>
        </div>
      </div>

      {/* Swap Section */}
      <div className="mb-8">
        <h3 className="text-xl font-mono text-green-500 mb-4">Swap</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SOL to Token */}
          <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
            <h4 className="text-lg font-mono text-green-500 mb-4">Swap SOL</h4>
            <JupiterSwapForm
              initialInputMint="So11111111111111111111111111111111111111112"
              initialOutputMint={id}
              inputTokenName="SOL"
              outputTokenName={tokenInfo.content.metadata.symbol}
              inputDecimals={9}
            />
          </div>

          {/* USDC to Token */}
          <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
            <h4 className="text-lg font-mono text-green-500 mb-4">Swap USDC</h4>
            <JupiterSwapForm
              initialInputMint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
              initialOutputMint={id}
              inputTokenName="USDC"
              outputTokenName={tokenInfo.content.metadata.symbol}
              inputDecimals={6}
            />
          </div>
        </div>
      </div>

      {/* Token Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
          <h3 className="text-xl font-mono text-green-500 mb-4">Token Info</h3>
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
                <span className="text-green-500/60 text-sm">{item.label}</span>
                <span className="font-mono text-green-400 break-all">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
          <h3 className="text-xl font-mono text-green-500 mb-4">Authority</h3>
          <div className="space-y-3">
            {tokenInfo.authorities.map((authority, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-green-500/60 text-sm">Address</span>
                <span className="font-mono text-green-400 break-all">
                  {authority.address}
                </span>
                <span className="text-green-500/60 text-sm mt-1">Scopes</span>
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
            ))}
          </div>
        </div>
      </div>

      {/* Birdeye Chart */}
      <div className="mb-8">
        <h3 className="text-xl font-mono text-green-500 mb-4">Price Chart</h3>
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
      <div className="mb-8">
        <h3 className="text-xl font-mono text-green-500 mb-4">
          Transaction History
        </h3>
        <TransactionSection walletAddress={id} hasSearched={true} />
      </div>
    </div>
  )
}
