'use client'

import { DataContainer } from '@/components/common/DataContainer'
import { FilterBar } from '@/components/common/FilterBar'
import { FilterButton } from '@/components/common/FilterButton'
import { TokenContainer } from '@/components/token-container'
import type { FungibleToken, NFT } from '@/utils/types'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations()

  useEffect(() => {
    const fetchTokens = async () => {
      if (!address) return

      setIsLoading(true)
      setError(undefined)

      try {
        const response = await fetch(`/api/tokens?address=${address}&type=all`)
        if (!response.ok) {
          throw new Error(`${t('error.http_error_status')}: ${response.status}`)
        }
        const data = await response.json()
        if ('error' in data) {
          throw new Error(data.error)
        }

        setTokenData(data)
      } catch (error) {
        console.error(t('error.error_fetching_tokens'), error)
        setError(t('error.failed_to_fetch_tokens'))
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
      title={t('portfolio_assets.title')}
      count={filteredItems.length}
      error={error}
    >
      <FilterBar>
        <FilterButton
          label={t('common.tokens')}
          isSelected={activeTab === 'fungible'}
          onClick={() => setActiveTab('fungible')}
        />
        <FilterButton
          label={t('common.nfts')}
          isSelected={activeTab === 'nft'}
          onClick={() => setActiveTab('nft')}
        />
      </FilterBar>
      <div className="flex-grow overflow-auto">{renderContent()}</div>
    </DataContainer>
  )
}
