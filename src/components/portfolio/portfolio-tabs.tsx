'use client'

import { DataContainer } from '@/components/common/DataContainer'
import { FilterBar } from '@/components/common/FilterBar'
import { FilterButton } from '@/components/common/FilterButton'
import { TokenContainer } from '@/components/token-container'
import type { FungibleToken, NFT } from '@/utils/types'
import { useEffect, useState } from 'react'

interface PortfolioTabsProps {
  address: string
}

interface TokenData {
  items: (FungibleToken | NFT)[]
  nativeBalance: {
    lamports: number
    price_per_sol: number
    total_price: number
  }
}

type TokenTab = 'fungible' | 'nft'

export default function PortfolioTabs({ address }: PortfolioTabsProps) {
  const [activeTab, setActiveTab] = useState<TokenTab>('fungible')
  const [tokenData, setTokenData] = useState<TokenData | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    const fetchTokens = async () => {
      if (!address) return

      setIsLoading(true)
      setError(undefined)

      try {
        const response = await fetch(`/api/tokens?address=${address}&type=all`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if ('error' in data) {
          throw new Error(data.error)
        }

        setTokenData(data)
      } catch (error) {
        console.error('Error fetching tokens:', error)
        setError('Failed to fetch tokens.')
        setTokenData(undefined)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokens()
  }, [address])

  const renderContent = () => {
    return (
      <TokenContainer
        hasSearched={true}
        tokenType={activeTab}
        hideTitle={true}
        tokenData={tokenData}
        isLoading={isLoading}
        error={error}
      />
    )
  }

  const filteredItems =
    tokenData?.items.filter((item) => {
      if (activeTab === 'fungible') {
        return (
          item.interface === 'FungibleToken' ||
          item.interface === 'FungibleAsset'
        )
      } else {
        return (
          item.interface !== 'FungibleToken' &&
          item.interface !== 'FungibleAsset'
        )
      }
    }) || []

  return (
    <DataContainer
      title="portfolio_assets"
      count={filteredItems.length}
      error={error}
    >
      <FilterBar>
        <FilterButton
          label="Tokens"
          isSelected={activeTab === 'fungible'}
          onClick={() => setActiveTab('fungible')}
        />
        <FilterButton
          label="NFTs"
          isSelected={activeTab === 'nft'}
          onClick={() => setActiveTab('nft')}
        />
      </FilterBar>
      <div className="flex-grow overflow-auto">{renderContent()}</div>
    </DataContainer>
  )
}
