'use client'

import { DAS } from 'helius-sdk'
import { useEffect, useState } from 'react'

export function useNFTData(walletAddress: string) {
  const [nfts, setNfts] = useState<DAS.GetAssetResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNFTs() {
      if (!walletAddress) {
        setNfts([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Replace this with your actual API call
        const response = await fetch(`/api/nfts?wallet=${walletAddress}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch NFTs: ${response.statusText}`)
        }

        const data = await response.json()
        setNfts(data.nfts || [])
      } catch (err) {
        console.error('Error fetching NFTs:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch NFTs')
        setNfts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchNFTs()
  }, [walletAddress])

  return { nfts, isLoading, error }
}
