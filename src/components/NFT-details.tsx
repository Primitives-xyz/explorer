'use client'

import { CopyPaste } from '@/components/common/copy-paste'
import { LoadCircle } from '@/components/common/load-circle'
import { TransactionSection } from '@/components/transaction-section'
import { useNFTImage } from '@/hooks/use-nft-image'
import type { NFTTokenInfo } from '@/types/Token'
import { route } from '@/utils/routes'
import { DAS } from 'helius-sdk'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface NFTDetailsProps {
  id: string
  tokenInfo: NFTTokenInfo
}

type NFTTab = 'overview' | 'technical' | 'transactions'

interface NFTImageProps {
  url: string | null
  name: string
  isLoading: boolean
  className?: string
}

function NFTImage({ url, name, isLoading, className = '' }: NFTImageProps) {
  const [error, setError] = useState(false)

  if (isLoading) {
    return (
      <div
        className={`${className} bg-black/40 flex items-center justify-center`}
      >
        <LoadCircle />
      </div>
    )
  }

  if (error || !url) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-green-950/40 to-black/40 flex items-center justify-center p-4`}
      >
        <div className="text-center">
          <div className=" text-4xl mb-2">🖼️</div>
          <div className="/60 font-mono text-sm break-words">
            {name || 'NFT'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} relative`}>
      <Image
        src={url}
        alt={name}
        fill
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  )
}

export default function NFTDetails({ id, tokenInfo }: NFTDetailsProps) {
  const [activeTab, setActiveTab] = useState<NFTTab>('overview')
  const { url: imageUrl, isLoading: imageLoading } = useNFTImage(
    tokenInfo.content
  )

  const getTabStyle = (tab: NFTTab) => {
    const isActive = activeTab === tab
    return `px-4 py-2 font-mono text-sm transition-all duration-300 relative ${
      isActive
        ? ' bg-green-500/10 border border-green-500/30'
        : ' hover: hover:bg-green-500/10'
    }`
  }

  const renderOverviewTab = () => (
    <>
      {/* Key Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl hover:border-green-600/40 transition-all group">
          <h3 className="/60 text-sm font-mono mb-2">Ownership Model</h3>
          <div className="text-xl font-bold  font-mono group-hover: transition-colors capitalize">
            {tokenInfo.ownership.ownership_model}
          </div>
        </div>

        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl hover:border-green-600/40 transition-all group">
          <h3 className="/60 text-sm font-mono mb-2">NFT Type</h3>
          <div className="text-xl font-bold  font-mono group-hover: transition-colors">
            {tokenInfo.compression?.compressed ? 'Compressed' : 'Regular'} NFT
          </div>
        </div>

        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl hover:border-green-600/40 transition-all group">
          <h3 className="/60 text-sm font-mono mb-2">Royalty</h3>
          <div className="text-xl font-bold  font-mono group-hover: transition-colors">
            {tokenInfo.royalty?.percent || 0}%
          </div>
        </div>
      </div>

      {/* NFT Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          {/* NFT Info */}
          <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
            <h3 className="text-xl font-mono  mb-4">NFT Info</h3>
            <div className="space-y-3">
              {[
                { label: 'NFT Address', value: id },
                { label: 'Owner', value: tokenInfo.ownership.owner },
                {
                  label: 'Collection',
                  value:
                    tokenInfo.grouping?.find(
                      (g: { group_key: string; group_value: string }) =>
                        g.group_key === 'collection'
                    )?.group_value || 'None',
                  extraContent: (value: string) =>
                    value !== 'None' && (
                      <a
                        href={`https://www.tensor.trade/trade/${value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs font-mono bg-green-900/30  hover:bg-green-900/50 transition-colors rounded-md flex items-center gap-1"
                      >
                        <svg
                          viewBox="0 0 500 500"
                          className="w-3 h-3 fill-current"
                        >
                          <path d="M250 0L31.25 125v250L250 500l218.75-125v-250L250 0zm156.25 334.375L250 428.125l-156.25-93.75v-187.5L250 71.875l156.25 93.75v168.75z" />
                        </svg>
                        Trade
                      </a>
                    ),
                },
                {
                  label: 'Status',
                  value: tokenInfo.burnt
                    ? 'Burnt'
                    : tokenInfo.ownership.frozen
                    ? 'Frozen'
                    : 'Active',
                },
              ].map((item, i) => (
                <div key={i} className="flex flex-col">
                  <span className="/60 text-sm">{item.label}</span>
                  <div className="flex items-center gap-2">
                    {item.label === 'NFT Address' || item.label === 'Owner' ? (
                      <Link
                        href={route('address', { id: item.value })}
                        className="font-mono  break-all hover: transition-colors"
                      >
                        {item.value}
                      </Link>
                    ) : (
                      <span className="font-mono  break-all">{item.value}</span>
                    )}
                    {(item.label === 'NFT Address' ||
                      item.label === 'Owner' ||
                      (item.label === 'Collection' &&
                        item.value !== 'None')) && (
                      <CopyPaste content={item.value} />
                    )}
                    {item.extraContent?.(item.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Authorities */}
          <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
            <h3 className="text-xl font-mono  mb-4">Authorities</h3>
            <div className="space-y-3">
              {tokenInfo.authorities.map(
                (
                  authority: { address: string; scopes: string[] },
                  i: number
                ) => (
                  <div key={i} className="flex flex-col">
                    <span className="/60 text-sm">Address</span>
                    <Link
                      href={route('address', { id: authority.address })}
                      className="font-mono  break-all hover: transition-colors"
                    >
                      {authority.address}
                    </Link>
                    <span className="/60 text-sm mt-1">Scopes</span>
                    <div className="flex flex-wrap gap-2">
                      {authority.scopes.map((scope: string, j: number) => (
                        <span
                          key={j}
                          className="px-2 py-1 bg-green-500/10 rounded-md  text-sm"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Attributes and Creators */}
        <div className="space-y-6">
          {/* Attributes */}
          {tokenInfo.content.metadata.attributes && (
            <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
              <h3 className="text-xl font-mono  mb-4">Attributes</h3>
              <div className="grid grid-cols-2 gap-4">
                {tokenInfo.content.metadata.attributes.map(
                  (
                    attr: { trait_type: string; value: string },
                    index: number
                  ) => (
                    <div
                      key={index}
                      className="p-3 bg-black/30 rounded-lg border border-green-800/40 hover:border-green-600/40 transition-all group"
                    >
                      <h4 className="/60 text-xs mb-1 font-mono">
                        {attr.trait_type}
                      </h4>
                      <p className=" font-mono group-hover: transition-colors">
                        {attr.value}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Creators */}
          {tokenInfo.creators && tokenInfo.creators.length > 0 && (
            <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
              <h3 className="text-xl font-mono  mb-4">Creators</h3>
              <div className="space-y-3">
                {tokenInfo.creators.map(
                  (
                    creator: {
                      address: string
                      share?: number
                      verified?: boolean
                    },
                    index: number
                  ) => (
                    <div key={index} className="flex flex-col">
                      <div className="flex justify-between items-center">
                        <Link
                          href={route('address', { id: creator.address })}
                          className="font-mono  break-all hover: transition-colors"
                        >
                          {creator.address}
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="/60 text-sm">
                            {creator.share || 0}%
                          </span>
                          {creator.verified && (
                            <span className=" text-xs">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )

  const renderTechnicalTab = () => (
    <div className="space-y-6">
      {/* JSON URI */}
      {tokenInfo.content.$schema && (
        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
          <h4 className="/60 text-sm font-mono mb-2">Schema</h4>
          <div className="font-mono  break-all text-sm">
            {tokenInfo.content.$schema}
          </div>
        </div>
      )}

      {/* Files */}
      {tokenInfo.content.files && tokenInfo.content.files.length > 0 && (
        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
          <h4 className="/60 text-sm font-mono mb-4">Files</h4>
          <div className="space-y-4">
            {tokenInfo.content.files.map((file: DAS.File, index: number) => (
              <div
                key={index}
                className="p-4 bg-black/30 rounded-lg border border-green-800/40"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="/60 text-xs font-mono">URI</span>
                    <div className="font-mono  break-all text-sm">
                      {file.uri}
                    </div>
                  </div>
                  {file.mime && (
                    <div>
                      <span className="/60 text-xs font-mono">Type</span>
                      <div className="font-mono  text-sm">{file.mime}</div>
                    </div>
                  )}
                  {file.cdn_uri && (
                    <div className="md:col-span-2">
                      <span className="/60 text-xs font-mono">CDN URI</span>
                      <div className="font-mono  break-all text-sm">
                        {file.cdn_uri}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compression Info */}
      {tokenInfo.compression && (
        <div className="p-6 bg-black/40 border border-green-800/40 rounded-xl">
          <h4 className="/60 text-sm font-mono mb-4">Compression Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                label: 'Data Hash',
                value: tokenInfo.compression.data_hash,
              },
              {
                label: 'Creator Hash',
                value: tokenInfo.compression.creator_hash,
              },
              {
                label: 'Asset Hash',
                value: tokenInfo.compression.asset_hash,
              },
              { label: 'Tree', value: tokenInfo.compression.tree },
              {
                label: 'Sequence',
                value: tokenInfo.compression.seq.toString(),
              },
              {
                label: 'Leaf ID',
                value: tokenInfo.compression.leaf_id.toString(),
              },
              {
                label: 'Eligible',
                value: tokenInfo.compression.eligible ? 'Yes' : 'No',
              },
            ].map(
              (item, i) =>
                item.value && (
                  <div key={i} className="space-y-1">
                    <span className="/60 text-xs font-mono">{item.label}</span>
                    <div className="font-mono  break-all text-sm">
                      {item.value}
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="py-8">
      {/* Hero Section with NFT Identity */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-center gap-8 p-8 bg-black/40 border border-green-800 rounded-2xl backdrop-blur-sm">
          <div className="relative w-64 h-64 rounded-2xl border-2 border-green-500 overflow-hidden">
            <NFTImage
              url={imageUrl}
              name={tokenInfo.content.metadata.name}
              isLoading={imageLoading}
              className="w-full h-full"
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <h1 className="text-4xl font-bold  font-mono">
                {tokenInfo.content.metadata.name}
              </h1>
              <div className="flex items-center gap-3">
                {tokenInfo.content.metadata.symbol && (
                  <span className="px-4 py-1 bg-green-500/10 border border-green-500/20 rounded-full  font-mono">
                    {tokenInfo.content.metadata.symbol}
                  </span>
                )}
                <span className="text-xs px-3 py-1 bg-green-900/30 rounded-full /80 font-mono">
                  {tokenInfo.interface}
                </span>
              </div>
            </div>

            <p className="/70 max-w-2xl">
              {tokenInfo.content.metadata.description}
            </p>

            {tokenInfo.content.links?.external_url && (
              <a
                href={tokenInfo.content.links.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4  hover: transition-colors font-mono text-sm"
              >
                View External Link →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-black/50 w-full overflow-hidden flex flex-col mb-6">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={getTabStyle('overview')}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('technical')}
            className={getTabStyle('technical')}
          >
            Technical
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={getTabStyle('transactions')}
          >
            Transactions
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'technical' && renderTechnicalTab()}
        {activeTab === 'transactions' && (
          <TransactionSection walletAddress={id} hasSearched={true} />
        )}
      </div>
    </div>
  )
}
