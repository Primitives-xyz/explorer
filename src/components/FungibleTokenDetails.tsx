'use client'

import { formatNumber } from '@/utils/format'
import Image from 'next/image'
import { useState } from 'react'

interface FungibleTokenDetailsProps {
  id: string
  tokenInfo: {
    id: string
    interface: string
    content: {
      metadata: {
        name: string
        symbol: string
        description: string
      }
      files?: Array<{
        uri: string
        type: string
      }>
      links?: {
        image?: string
      }
    }
    authorities: Array<{
      address: string
      scopes: string[]
    }>
    royalty?: {
      royalty_model: string
      target: string
      percent: number
      basis_points: number
      primary_sale_happened: boolean
      locked: boolean
    }
    ownership: {
      owner: string
      delegate: string
      frozen: boolean
      delegated: boolean
      ownership_model: string
    }
    token_info: {
      symbol: string
      supply: number
      decimals: number
      token_program: string
      price_info?: {
        price_per_token: number
        currency: string
      }
    }
  }
}

const truncateAddress = (address: string) => {
  if (!address) return ''
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export default function FungibleTokenDetails({
  id,
  tokenInfo,
}: FungibleTokenDetailsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const imageUrl =
    tokenInfo.content?.links?.image || tokenInfo.content?.files?.[0]?.uri
  const marketCap =
    (tokenInfo.token_info.supply /
      Math.pow(10, tokenInfo.token_info.decimals)) *
    (tokenInfo.token_info.price_info?.price_per_token || 0)

  return (
    <div className="container mx-auto p-8">
      <div className="bg-black/50 border border-green-800 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image and Basic Info Section */}
            <div className="space-y-6">
              <div className="relative aspect-square w-full max-w-[300px] mx-auto rounded-lg overflow-hidden border border-green-800">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={tokenInfo.content.metadata.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-black/40 flex items-center justify-center">
                    <span className="text-green-500 font-mono text-4xl font-bold">
                      {tokenInfo.content.metadata.symbol.slice(0, 3)}
                    </span>
                  </div>
                )}
              </div>

              <div className="font-mono space-y-4">
                <h1 className="text-2xl text-green-500">
                  {tokenInfo.content.metadata.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-900/20 text-green-400 rounded">
                    {tokenInfo.content.metadata.symbol}
                  </span>
                  <span className="text-green-600">•</span>
                  <span className="text-green-600 text-sm">
                    {tokenInfo.interface}
                  </span>
                </div>
              </div>
            </div>

            {/* Token Details Section */}
            <div className="font-mono space-y-6">
              {/* Market Info */}
              <div className="space-y-4">
                <h2 className="text-green-500 text-lg">Market Info</h2>
                <div className="grid grid-cols-2 gap-4 bg-green-900/10 p-4 rounded">
                  {tokenInfo.token_info.price_info && (
                    <>
                      <div>
                        <h3 className="text-green-600 text-sm mb-1">Price</h3>
                        <p className="text-green-400">
                          $
                          {formatNumber(
                            tokenInfo.token_info.price_info.price_per_token,
                          )}{' '}
                          {tokenInfo.token_info.price_info.currency}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-green-600 text-sm mb-1">
                          Market Cap
                        </h3>
                        <p className="text-green-400">
                          ${formatNumber(marketCap)}
                        </p>
                      </div>
                    </>
                  )}
                  <div>
                    <h3 className="text-green-600 text-sm mb-1">Supply</h3>
                    <p className="text-green-400">
                      {formatNumber(
                        tokenInfo.token_info.supply /
                          Math.pow(10, tokenInfo.token_info.decimals),
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-green-600 text-sm mb-1">Decimals</h3>
                    <p className="text-green-400">
                      {tokenInfo.token_info.decimals}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expandable Sections */}
              {/* Description */}
              <div className="border-t border-green-800/30 pt-4">
                <button
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === 'description' ? null : 'description',
                    )
                  }
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-green-500">Description</h2>
                  <span className="text-green-600">
                    {expandedSection === 'description' ? '[-]' : '[+]'}
                  </span>
                </button>
                {expandedSection === 'description' && (
                  <p className="mt-2 text-green-400 text-sm">
                    {tokenInfo.content.metadata.description ||
                      'No description available'}
                  </p>
                )}
              </div>

              {/* Authorities */}
              <div className="border-t border-green-800/30 pt-4">
                <button
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === 'authorities' ? null : 'authorities',
                    )
                  }
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-green-500">Authorities</h2>
                  <span className="text-green-600">
                    {expandedSection === 'authorities' ? '[-]' : '[+]'}
                  </span>
                </button>
                {expandedSection === 'authorities' && (
                  <div className="mt-2 space-y-2">
                    {tokenInfo.authorities.map((authority, index) => (
                      <div
                        key={index}
                        className="bg-green-900/10 p-2 rounded text-sm"
                      >
                        <p className="text-green-400 break-all">
                          {authority.address}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {authority.scopes.map((scope, i) => (
                            <span
                              key={i}
                              className="text-xs px-1.5 py-0.5 bg-green-900/20 text-green-500 rounded"
                            >
                              {scope}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ownership */}
              <div className="border-t border-green-800/30 pt-4">
                <button
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === 'ownership' ? null : 'ownership',
                    )
                  }
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-green-500">Ownership</h2>
                  <span className="text-green-600">
                    {expandedSection === 'ownership' ? '[-]' : '[+]'}
                  </span>
                </button>
                {expandedSection === 'ownership' && (
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="bg-green-900/10 p-2 rounded">
                      <h3 className="text-green-600">Owner</h3>
                      <p className="text-green-400 break-all">
                        {tokenInfo.ownership.owner || 'Not set'}
                      </p>
                    </div>
                    <div className="bg-green-900/10 p-2 rounded">
                      <h3 className="text-green-600">Model</h3>
                      <p className="text-green-400">
                        {tokenInfo.ownership.ownership_model}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          tokenInfo.ownership.frozen
                            ? 'bg-red-900/20 text-red-400'
                            : 'bg-green-900/20 text-green-400'
                        }`}
                      >
                        {tokenInfo.ownership.frozen ? 'FROZEN' : 'NOT FROZEN'}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          tokenInfo.ownership.delegated
                            ? 'bg-yellow-900/20 text-yellow-400'
                            : 'bg-green-900/20 text-green-400'
                        }`}
                      >
                        {tokenInfo.ownership.delegated
                          ? 'DELEGATED'
                          : 'NOT DELEGATED'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Token Program */}
              <div className="border-t border-green-800/30 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-green-500">Token Program</h2>
                  <span className="text-green-400 text-sm font-mono">
                    {truncateAddress(tokenInfo.token_info.token_program)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
