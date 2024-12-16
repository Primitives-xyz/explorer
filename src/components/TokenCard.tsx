'use client'

import { Token } from '@/types/Token'
import Image from 'next/image'

interface TokenCardProps {
  token: Token
  tokenType: 'fungible' | 'nonfungible'
}

export default function TokenCard({ token, tokenType }: TokenCardProps) {
  const isFungible = tokenType === 'fungible'
  const imageUrl = token.content.links.image || '/placeholder.png'

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

  if (isFungible) {
    const balance =
      token.token_info.balance / Math.pow(10, token.token_info.decimals)
    const pricePerToken = token.token_info.price_info?.price_per_token || 0
    const totalValue = token.token_info.price_info?.total_price || 0
    const currency = token.token_info.price_info?.currency || 'USDC'
    const symbol = token.token_info.symbol || token.content.metadata.symbol

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src={imageUrl}
                alt={token.content.metadata.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold truncate">
                  {token.content.metadata.name}
                </h3>
                <span className="text-sm font-medium text-gray-500 ml-2">
                  {symbol}
                </span>
              </div>
              {totalValue > 0 && (
                <p className="text-sm font-medium text-green-600">
                  {formatCurrency(totalValue)} {currency}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Balance</span>
              <div className="text-right">
                <span className="text-sm font-medium">
                  {formatNumber(balance)}
                </span>
                <span className="text-xs text-gray-500 ml-1">{symbol}</span>
              </div>
            </div>

            {pricePerToken > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price</span>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      {formatCurrency(pricePerToken)}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      {currency}
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
                        {currency}
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

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative w-full h-48">
        <Image
          src={imageUrl}
          alt={token.content.metadata.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold truncate">
          {token.content.metadata.name}
        </h3>
        {token.content.metadata.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {token.content.metadata.description}
          </p>
        )}
        {token.content.metadata.attributes && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {token.content.metadata.attributes.map((attr, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500 truncate">
                  {attr.trait_type}
                </p>
                <p className="text-sm font-medium truncate">{attr.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
