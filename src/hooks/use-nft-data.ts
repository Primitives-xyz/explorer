import type { FungibleToken, NFT, TokenWithInscription } from '@/utils/types'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

interface TokenData {
  items: (FungibleToken | NFT | TokenWithInscription)[]
  nativeBalance: {
    lamports: number
    price_per_sol: number
    total_price: number
  }
}

interface UseNFTDataResult {
  nfts: (NFT | TokenWithInscription)[]
  isLoading: boolean
  error: string | undefined
  refetch: () => Promise<void>
}

/**
 * Custom hook for fetching NFT data for a wallet address
 */
export function useNFTData(address: string): UseNFTDataResult {
  const [tokenData, setTokenData] = useState<TokenData | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const t = useTranslations()

  const fetchNFTs = async () => {
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

  useEffect(() => {
    fetchNFTs()
  }, [address])

  // Filter out only NFT items
  const nfts =
    (tokenData?.items.filter((item) => {
      return (
        item.interface !== 'FungibleToken' && item.interface !== 'FungibleAsset'
      )
    }) as (NFT | TokenWithInscription)[]) || []

  return {
    nfts,
    isLoading,
    error,
    refetch: fetchNFTs,
  }
}
