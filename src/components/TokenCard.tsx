'use client'

import { FungibleToken, NFTToken } from '@/utils/helius'
import Image from 'next/image'

interface TokenCardProps {
  token: FungibleToken | NFTToken
  tokenType: 'fungible' | 'nonfungible'
}

function isFungibleToken(token: FungibleToken | NFTToken): token is FungibleToken {
  return 'balance' in token && 'symbol' in token
}

export default function TokenCard({ token, tokenType }: TokenCardProps) {
  const formatNumber = (num: number, maxDecimals = 2) => {
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(2)}B`
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K`
    } else if (num < 0.01 && num > 0) {
      return num.toFixed(6)
    } else {
      return num.toFixed(maxDecimals)
    }
  }

  const formatCurrency = (num: number) => {
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`
    } else if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(2)}K`
    } else if (num < 0.01 && num > 0) {
      return `$${num.toFixed(4)}`
    } else {
      return `$${num.toFixed(2)}`
    }
  }

  if (tokenType === 'fungible' && isFungibleToken(token)) {
    const totalValue = token.balance * (token.price || 0)

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src={token.imageUrl || '/placeholder.png'}
                alt={token.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold truncate">{token.name}</h3>
                <span className="text-sm font-medium text-gray-500 ml-2">
                  {token.symbol}
                </span>
              </div>
              {totalValue > 0 && (
                <p className="text-sm font-medium text-green-600">
                  {formatCurrency(totalValue)} {token.currency}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Balance</span>
              <div className="text-right">
                <span className="text-sm font-medium">
                  {formatNumber(token.balance)}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  {token.symbol}
                </span>
              </div>
            </div>

            {token.price && token.price > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price</span>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      {formatCurrency(token.price)}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      {token.currency}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Total Value
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(totalValue)}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        {token.currency}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (tokenType === 'nonfungible') {
    const nftToken = token as NFTToken
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src={nftToken.content?.links?.image || '/placeholder.png'}
                alt={nftToken.content?.metadata?.name || 'NFT'}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold truncate">
                  {nftToken.content?.metadata?.name || 'Unnamed NFT'}
                </h3>
                <span className="text-sm font-medium text-gray-500 ml-2">
                  {nftToken.content?.metadata?.symbol || 'NFT'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-gray-50 rounded-lg p-3 space-y-2">
            {nftToken.content?.metadata?.attributes?.map((attr: { trait_type: string; value: string | number }, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{attr.trait_type}</span>
                <span className="text-sm font-medium">{attr.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}
