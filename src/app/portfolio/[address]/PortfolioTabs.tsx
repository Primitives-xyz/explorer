'use client'

import { TokenContainer } from '@/components/TokenContainer'
import { FungibleToken, NFT } from '@/utils/types'
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
        walletAddress={address}
        hasSearched={true}
        tokenType={activeTab}
        hideTitle={true}
        tokenData={tokenData}
        isLoading={isLoading}
        error={error}
      />
    )
  }

  const getTabStyle = (tab: TokenTab) => {
    const isActive = activeTab === tab
    return `px-4 py-2 font-mono text-sm transition-all duration-300 relative ${
      isActive
        ? 'text-green-300 bg-green-500/10 border border-green-500/30'
        : 'text-green-600 hover:text-green-500 hover:bg-green-500/10'
    }`
  }

  return (
    <div className="h-full flex flex-col bg-black/20">
      <div className="border-b border-green-500/20">
        <div className="flex flex-wrap gap-4 p-4">
          <button
            onClick={() => setActiveTab('fungible')}
            className={getTabStyle('fungible')}
          >
            Tokens
          </button>
          <button
            onClick={() => setActiveTab('nft')}
            className={getTabStyle('nft')}
          >
            NFTs
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-auto">{renderContent()}</div>
    </div>
  )
}
