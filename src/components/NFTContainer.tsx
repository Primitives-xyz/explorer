'use client'

import { FungibleToken, NFT } from '@/utils/types'
import { useEffect, useState } from 'react'
import { NFTSection } from './NFTSection'
import { TransactionSection } from './TransactionSection'

interface TokenContainerProps {
  walletAddress: string
  hasSearched?: boolean
  tokenType?: 'all' | 'fungible' | 'nft' | 'compressed' | 'programmable'
  hideTitle?: boolean
}

interface TokenData {
  items: (FungibleToken | NFT)[]
  nativeBalance: {
    lamports: number
    price_per_sol: number
    total_price: number
  }
}

export const NFTContainer = ({
  walletAddress,
  hasSearched,
  tokenType = 'all',
  hideTitle = false,
}: TokenContainerProps) => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTokens = async () => {
      if (!walletAddress || !hasSearched) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/tokens?address=${walletAddress}&type=all`,
        )
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if ('error' in data) {
          throw new Error(data.error)
        }

        console.log('Raw data received:', data)
        console.log('Current token type:', tokenType)
        console.log('Total items before filtering:', data.items.length)

        const filteredData = {
          ...data,
          items: data.items.filter((item: FungibleToken | NFT) => {
            console.log('Processing item:', {
              interface: item.interface,
              compressed: item.compressed,
              name: item.name,
            })

            // Exclude fungible tokens
            if (
              item.interface === 'FungibleToken' ||
              item.interface === 'FungibleAsset'
            ) {
              return false
            }

            switch (tokenType) {
              case 'nft':
                return (
                  ['V1_NFT', 'V2_NFT', 'LEGACY_NFT', 'MplCoreAsset'].includes(
                    item.interface,
                  ) && !item.compressed
                )
              case 'compressed':
                return (
                  ['V1_NFT', 'V2_NFT'].includes(item.interface) &&
                  item.compressed
                )
              case 'programmable':
                return item.interface === 'ProgrammableNFT'
              case 'all':
              default:
                return true
            }
          }),
        }

        console.log('Total items after filtering:', filteredData.items.length)
        console.log('Filtered items:', filteredData.items)

        setTokenData(filteredData)
      } catch (error) {
        console.error('Error fetching tokens:', error)
        setError('Failed to fetch tokens.')
        setTokenData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokens()
  }, [walletAddress, hasSearched, tokenType])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-4 w-full">
      <div className="min-w-0">
        <NFTSection
          walletAddress={walletAddress}
          hasSearched={hasSearched}
          tokenType={tokenType}
          hideTitle={hideTitle}
          isLoading={isLoading}
          error={error}
          items={tokenData?.items}
        />
      </div>
      <div className="min-w-0">
        <TransactionSection
          walletAddress={walletAddress}
          hasSearched={hasSearched}
        />
      </div>
    </div>
  )
}
