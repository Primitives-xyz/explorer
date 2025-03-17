// Cache for auction house addresses to prevent redundant API calls
const auctionHouseCache = new Map<string, string>()

export function useFetchAuctionHouse() {
  // Fetch auction house address only when needed
  const fetchAuctionHouse = async (
    collectionAddress: string
  ): Promise<string | null> => {
    try {
      // Check if we already have this auction house in cache
      if (auctionHouseCache.has(collectionAddress)) {
        return auctionHouseCache.get(collectionAddress) || null
      }

      // First get collection symbol
      const getCollectionSymbolRes = await fetch(
        `/api/magiceden/collection/${collectionAddress}`
      )
      const collectionSymbolData = await getCollectionSymbolRes.json()
      const collectionSymbol = collectionSymbolData.collectionSymbol

      if (collectionSymbol) {
        // Then get auction house address
        const auctionHouseRes = await fetch(
          `/api/magiceden/collection/${collectionSymbol}/auctionHouse`
        )
        const auctionHouseResData = await auctionHouseRes.json()
        const auctionHouseAddress = auctionHouseResData.auctionHouse

        // Cache the result
        if (auctionHouseAddress) {
          auctionHouseCache.set(collectionAddress, auctionHouseAddress)
        }

        return auctionHouseAddress
      }
      return null
    } catch (error) {
      console.error('Error fetching auction house info:', error)
      return null
    }
  }

  return {
    fetchAuctionHouse,
  }
}
