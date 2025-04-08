import { DAS } from 'helius-sdk/dist/src/types/das-types'
import {
  AssetSortBy,
  AssetSortDirection,
} from 'helius-sdk/dist/src/types/enums'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

// Use the Helius SDK types
type AssetResponse = DAS.GetAssetResponseList
type AssetItem = DAS.GetAssetResponse

interface UseNFTDataResult {
  nfts: AssetItem[]
  loading: boolean
  error: string | undefined
  refetch: () => Promise<void>
  loadMore: () => Promise<void>
  hasMore: boolean
  totalCount: number
  sortBy: AssetSortBy | string
  sortDirection: AssetSortDirection | string
  setSorting: (
    sortBy: AssetSortBy | string,
    sortDirection: AssetSortDirection | string
  ) => void
  nativeBalance?: DAS.NativeBalanceInfo
}

/**
 * Custom hook for fetching NFT data for a wallet address using Helius API
 * @param address The wallet address to fetch NFTs for
 * @param showFungible Whether to include fungible tokens. Defaults to false.
 * @param showNativeBalance Whether to include native SOL balance. Defaults to false.
 * @param showCollectionMetadata Whether to include collection metadata. Defaults to true.
 * @param pageSize Number of items to fetch per page. Defaults to 100.
 * @param initialSortBy Initial sort criteria. Defaults to AssetSortBy.RecentAction.
 * @param initialSortDirection Initial sort direction. Defaults to AssetSortDirection.Desc.
 */
export function useParseNFTData(
  address: string,
  showFungible: boolean = false,
  showNativeBalance: boolean = false,
  showCollectionMetadata: boolean = true,
  pageSize: number = 100,
  initialSortBy: AssetSortBy = AssetSortBy.RecentAction,
  initialSortDirection: AssetSortDirection = AssetSortDirection.Desc
): UseNFTDataResult {
  const [assets, setAssets] = useState<AssetItem[]>([])
  const [nativeBalance, setNativeBalance] = useState<
    DAS.NativeBalanceInfo | undefined
  >(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [sortBy, setSortBy] = useState<AssetSortBy | string>(initialSortBy)
  const [sortDirection, setSortDirection] = useState<
    AssetSortDirection | string
  >(initialSortDirection)
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const t = useTranslations()

  const fetchAssets = async (page: number = 1, append: boolean = false) => {
    if (!address) return

    if (page === 1) {
      setLoading(true)
    } else {
      setIsLoadingMore(true)
    }
    setError(undefined)

    try {
      // Build the query parameters
      const queryParams = new URLSearchParams({
        showFungible: showFungible.toString(),
        showNativeBalance: showNativeBalance.toString(),
        showCollectionMetadata: showCollectionMetadata.toString(),
        page: page.toString(),
        limit: pageSize.toString(),
      })

      // Add sorting parameters if they exist
      if (sortBy && sortDirection) {
        queryParams.append('sortBy', sortBy.toString())
        queryParams.append('sortDirection', sortDirection.toString())
      }

      // Add pagination cursor if loading more
      if (page > 1 && nextCursor) {
        queryParams.append('after', nextCursor)
      }

      // Fetch assets from the Helius API endpoint
      const response = await fetch(
        `/api/wallets/getAssets/${address}?${queryParams.toString()}`
      )

      if (!response.ok) {
        // Try to get more detailed error information
        let errorDetail = ''
        try {
          const errorData = await response.json()
          errorDetail = errorData.error || ''
        } catch (e) {
          // If we can't parse the error response, just use the status
        }

        const errorMessage = `${t('error.http_error_status')}: ${
          response.status
        }${errorDetail ? ` - ${errorDetail}` : ''}`
        throw new Error(errorMessage)
      }

      const data = (await response.json()) as AssetResponse

      // Update state with the fetched data
      if (append) {
        setAssets((prev) => [...prev, ...data.items])
      } else {
        setAssets(data.items)
      }

      // Set native balance if available
      if (data.nativeBalance) {
        setNativeBalance(data.nativeBalance)
      }

      // Store the cursor for pagination if available
      setNextCursor(data.cursor)

      // Calculate if there are more items to fetch
      const hasMoreItems =
        data.total > page * pageSize && data.items.length === pageSize
      setHasMore(hasMoreItems)
      setTotalCount(data.total || 0)
      setCurrentPage(page)
    } catch (error) {
      console.error(t('error.error_fetching_assets'), error)
      setError(
        typeof error === 'object' && error instanceof Error
          ? error.message
          : t('error.failed_to_fetch_assets')
      )
    } finally {
      if (page === 1) {
        setLoading(false)
      } else {
        setIsLoadingMore(false)
      }
    }
  }

  const loadMore = async () => {
    if (hasMore && !isLoadingMore) {
      await fetchAssets(currentPage + 1, true)
    }
  }

  const setSorting = (
    newSortBy: AssetSortBy | string,
    newSortDirection: AssetSortDirection | string
  ) => {
    setSortBy(newSortBy)
    setSortDirection(newSortDirection)
  }

  useEffect(() => {
    setCurrentPage(1)
    setAssets([])
    setNextCursor(undefined)
    fetchAssets(1, false)
  }, [
    address,
    showFungible,
    showNativeBalance,
    showCollectionMetadata,
    sortBy,
    sortDirection,
  ])

  return {
    nfts: assets,
    loading,
    error,
    refetch: () => fetchAssets(1, false),
    loadMore,
    hasMore,
    totalCount,
    sortBy,
    sortDirection,
    setSorting,
    nativeBalance,
  }
}
