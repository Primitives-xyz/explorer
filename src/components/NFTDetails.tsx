'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface NFTDetailsProps {
  id: string
}

interface NFTData {
  id: string
  interface: string
  content: {
    metadata: {
      name: string
      symbol: string
      description: string
      attributes?: Array<{
        trait_type: string
        value: string
      }>
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
  compression?: {
    compressed: boolean
    data_hash: string
    creator_hash: string
    asset_hash: string
    tree: string
    seq: number
    leaf_id: number
  }
  grouping?: Array<{
    group_key: string
    group_value: string
  }>
  royalty?: {
    royalty_model: string
    target: string
    percent: number
    basis_points: number
    primary_sale_happened: boolean
    locked: boolean
  }
  creators?: Array<{
    address: string
    share: number
    verified: boolean
  }>
  ownership: {
    owner: string
    delegate: string
    frozen: boolean
    delegated: boolean
    ownership_model: string
  }
  supply?: {
    print_max_supply: number
    print_current_supply: number
    edition_nonce: number
  }
  mutable: boolean
  burnt: boolean
}

export default function NFTDetails({ id }: NFTDetailsProps) {
  const [nft, setNFT] = useState<NFTData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNFT = async () => {
      try {
        const response = await fetch(`/api/asset/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch NFT data')
        }
        const data = await response.json()
        setNFT(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch NFT')
      } finally {
        setLoading(false)
      }
    }

    fetchNFT()
  }, [id])

  if (loading) {
    return (
      <div className="text-green-500 font-mono text-center p-8">
        Loading NFT data...
      </div>
    )
  }

  if (error || !nft) {
    return (
      <div className="text-red-500 font-mono text-center p-8">
        Error loading NFT: {error}
      </div>
    )
  }

  const imageUrl = nft.content?.links?.image || nft.content?.files?.[0]?.uri

  return (
    <div className="container mx-auto p-8">
      <div className="bg-black/50 border border-green-800 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-green-800">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={nft.content.metadata.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* Details Section */}
            <div className="font-mono">
              <h1 className="text-2xl text-green-500 mb-4">
                {nft.content.metadata.name}
              </h1>

              {nft.content.metadata.description && (
                <div className="mb-6">
                  <h2 className="text-green-600 text-sm mb-2">Description</h2>
                  <p className="text-green-400 text-sm">
                    {nft.content.metadata.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h2 className="text-green-600 mb-1">Symbol</h2>
                  <p className="text-green-400">
                    {nft.content.metadata.symbol}
                  </p>
                </div>
                <div>
                  <h2 className="text-green-600 mb-1">Owner</h2>
                  <p className="text-green-400 break-all">
                    {nft.ownership.owner}
                  </p>
                </div>
                <div>
                  <h2 className="text-green-600 mb-1">Type</h2>
                  <p className="text-green-400">
                    {nft.compression?.compressed ? 'Compressed' : 'Regular'} NFT
                  </p>
                </div>
                {nft.supply && (
                  <div>
                    <h2 className="text-green-600 mb-1">Edition</h2>
                    <p className="text-green-400">
                      {nft.supply.print_current_supply} of{' '}
                      {nft.supply.print_max_supply}
                    </p>
                  </div>
                )}
              </div>

              {nft.content.metadata.attributes && (
                <div className="mt-6">
                  <h2 className="text-green-600 mb-2">Attributes</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {nft.content.metadata.attributes.map((attr, index) => (
                      <div
                        key={index}
                        className="bg-black/30 p-2 rounded border border-green-900"
                      >
                        <h3 className="text-green-600 text-xs">
                          {attr.trait_type}
                        </h3>
                        <p className="text-green-400">{attr.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {nft.creators && nft.creators.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-green-600 mb-2">Creators</h2>
                  <div className="space-y-2 text-sm">
                    {nft.creators.map((creator, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-green-400 break-all">
                          {creator.address}
                        </span>
                        <span className="text-green-600 ml-2">
                          {creator.share}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
