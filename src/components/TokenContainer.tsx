import { FungibleToken, NFT } from '@/utils/types'
import { useEffect, useState } from 'react'
import { TokenSection } from './TokenSection'
import { SolBalanceSection } from './tokens/SolBalanceSection'

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

export const TokenContainer = ({
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

        setTokenData(data)
      } catch (error) {
        console.error('Error fetching tokens:', error)
        setError('Failed to fetch tokens.')
        setTokenData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokens()
  }, [walletAddress, hasSearched])

  return (
    <div className="flex flex-col gap-4">
      <SolBalanceSection
        walletAddress={walletAddress}
        hasSearched={hasSearched}
        hideTitle={hideTitle}
        isLoading={isLoading}
        error={error}
        nativeBalance={tokenData?.nativeBalance}
      />
      <TokenSection
        walletAddress={walletAddress}
        hasSearched={hasSearched}
        tokenType={tokenType}
        hideTitle={hideTitle}
        isLoading={isLoading}
        error={error}
        items={tokenData?.items}
      />
    </div>
  )
}
