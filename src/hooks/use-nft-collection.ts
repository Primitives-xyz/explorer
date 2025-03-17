import { CollectionListItem, CollectionStat } from '@/types/nft/magic-eden'
import { collectionListItemToNFT } from '@/utils/nft'
import { NFT } from '@/utils/types'
import { useEffect, useState } from 'react'
import { useCollectionStats } from './use-collection-stats'

interface UseNftCollectionResult {
  collectionSymbol: string | null
  nftCollectionStat: CollectionStat | null
  nfts: NFT[]
  isLoading: boolean
}

export function useNftCollection(
  id: string,
  fetchStatsImmediately: boolean = true
): UseNftCollectionResult {
  // Collection-related state
  const [collectionSymbol, setCollectionSymbol] = useState<string | null>(null)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [shouldFetchStats, setShouldFetchStats] = useState<boolean>(
    fetchStatsImmediately
  )

  // Use the collection stats hook only when needed
  const { collectionStat: nftCollectionStat, isLoading: statsLoading } =
    useCollectionStats(shouldFetchStats ? collectionSymbol : null)

  // Fetch collection symbol
  useEffect(() => {
    const fetchCollectionSymbol = async () => {
      try {
        const response = await fetch(`/api/magiceden/collection/${id}`)
        const data = await response.json()
        setCollectionSymbol(data.collectionSymbol)
      } catch (error) {
        console.error('Error fetching collection symbol:', error)
      }
    }

    fetchCollectionSymbol()
  }, [id])

  // Fetch collection lists
  useEffect(() => {
    const fetchCollectionLists = async () => {
      if (!collectionSymbol) return

      try {
        // Fetch collection lists
        const collectionListsRes = await fetch(
          `/api/magiceden/collection/${collectionSymbol}/lists`
        )
        const collectionListsResData = await collectionListsRes.json()

        // Convert CollectionListItems to NFTs
        const convertedNfts = collectionListsResData.collectionLists.map(
          (item: CollectionListItem) => collectionListItemToNFT(item)
        )
        setNfts(convertedNfts)
      } catch (error) {
        console.error('Error fetching collection lists:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollectionLists()
  }, [collectionSymbol])

  return {
    collectionSymbol,
    nftCollectionStat,
    nfts,
    isLoading: isLoading || (shouldFetchStats && statsLoading),
  }
}
