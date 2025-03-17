import { CollectionListItem, CollectionStat } from '@/types/nft/magic-eden'
import { collectionListItemToNFT } from '@/utils/nft'
import { NFT } from '@/utils/types'
import { useEffect, useState } from 'react'
import { useCollectionStats } from './use-collection-stats'
import { useCollectionSymbol } from './use-collection-symbol'

interface UseNftCollectionResult {
  collectionSymbol: string | null
  nftCollectionStat: CollectionStat | null
  nfts: NFT[]
  isLoading: boolean
  error: Error | null
}

export function useNftCollection(
  id: string,
  fetchStatsImmediately: boolean = true
): UseNftCollectionResult {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [error, setError] = useState<Error | null>(null)

  // Use the new collection symbol hook
  const {
    collectionSymbol,
    isLoading: symbolLoading,
    error: symbolError,
  } = useCollectionSymbol(id)

  // Use the collection stats hook only when needed
  const { collectionStat: nftCollectionStat, isLoading: statsLoading } =
    useCollectionStats(fetchStatsImmediately ? collectionSymbol : null)

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
        setError(
          error instanceof Error
            ? error
            : new Error('Failed to fetch collection lists')
        )
      }
    }

    fetchCollectionLists()
  }, [collectionSymbol])

  return {
    collectionSymbol,
    nftCollectionStat,
    nfts,
    isLoading: symbolLoading || (fetchStatsImmediately && statsLoading),
    error: symbolError || error,
  }
}
