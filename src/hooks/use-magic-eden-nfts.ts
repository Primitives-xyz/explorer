import { MagicEdenNFT } from '@/types/nft/magic-eden'
import { magicEdenNFTToNFT } from '@/utils/nft'
import { NFT } from '@/utils/types'
import { useEffect, useState } from 'react'

interface UseMagicEdenNFTsResult {
  walletAddress: string
  nfts: NFT[]
  isLoading: boolean
  error: string | null
}

/**
 * Hook to fetch NFTs from a Magic Eden wallet address and convert them to our NFT type
 *
 * @param address The wallet address to fetch NFTs for
 * @returns An object containing the wallet address, NFTs, original tokens, loading state, and any error
 */
export function useMagicEdenNFTs(address: string): UseMagicEdenNFTsResult {
  const [walletAddress] = useState<string>(address)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWalletNFTs = async () => {
      if (!walletAddress) {
        setError('Wallet address is required')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Fetch NFTs from the Magic Eden API
        const response = await fetch(`/api/magiceden/wallet/${walletAddress}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch wallet NFTs')
        }

        const data = await response.json()

        // Convert the tokens to our NFT type
        const convertedNfts = data.map((item: MagicEdenNFT) =>
          magicEdenNFTToNFT(item)
        )

        setNfts(convertedNfts)
      } catch (error) {
        console.error('Error fetching wallet NFTs:', error)
        setError(
          error instanceof Error ? error.message : 'Failed to fetch wallet NFTs'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchWalletNFTs()
  }, [walletAddress])

  return {
    walletAddress,
    nfts,
    isLoading,
    error,
  }
}
