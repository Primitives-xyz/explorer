import type { FungibleToken } from '@/utils/types'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

interface TokenData {
  items: FungibleToken[]
  nativeBalance: {
    lamports: number
    price_per_sol: number
    total_price: number
  }
  total: number
  page: number
  limit: number
}

interface UseTokenDataResult {
  tokens: FungibleToken[]
  fungibleTokens: FungibleToken[]
  nativeBalance:
    | {
        lamports: number
        price_per_sol: number
        total_price: number
      }
    | undefined
  isLoading: boolean
  error: string | undefined
  refetch: () => Promise<void>
  hasMoreTokens: boolean
  loadMoreTokens: () => Promise<void>
  loadingMore: boolean
  progress: {
    loaded: number
    total: number
    percentage: number
  }
}

/**
 * Custom hook for fetching all token data for a wallet address
 */
export function useTokenData(
  address: string,
  autoLoadAll = false
): UseTokenDataResult {
  const [tokenData, setTokenData] = useState<TokenData | undefined>(undefined)
  const [allTokens, setAllTokens] = useState<FungibleToken[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreTokens, setHasMoreTokens] = useState(false)
  const [progress, setProgress] = useState({
    loaded: 0,
    total: 0,
    percentage: 0,
  })
  const t = useTranslations()

  // Increase page size to fetch more tokens at once
  const TOKENS_PER_PAGE = 250 // Maximum allowed by Helius API

  const fetchTokens = async (resetData = true) => {
    if (!address) return

    if (resetData) {
      setIsLoading(true)
      setAllTokens([])
      setCurrentPage(1)
      setProgress({ loaded: 0, total: 0, percentage: 0 })
    } else {
      setLoadingMore(true)
    }

    setError(undefined)

    try {
      console.log(
        `Fetching tokens: page ${
          resetData ? 1 : currentPage
        }, limit ${TOKENS_PER_PAGE}`
      )

      const response = await fetch(
        `/api/tokens?address=${address}&type=fungible&limit=${TOKENS_PER_PAGE}&page=${
          resetData ? 1 : currentPage
        }`
      )
      if (!response.ok) {
        throw new Error(`${t('error.http_error_status')}: ${response.status}`)
      }
      const data = await response.json()
      if ('error' in data) {
        throw new Error(data.error)
      }

      // Log the response data for debugging
      console.log(
        `Received ${data.items?.length || 0} tokens, total: ${data.total || 0}`
      )

      // Update token data
      setTokenData(data)

      // Calculate if there are more tokens to load
      const total = data.total || 0
      const receivedItems = data.items?.length || 0

      // If we received exactly the limit number of tokens, there might be more
      // even if the API reports total = limit
      const mightHaveMoreTokens = receivedItems === TOKENS_PER_PAGE

      const loadedCount = resetData
        ? receivedItems
        : allTokens.length + receivedItems

      // Update progress
      setProgress({
        loaded: loadedCount,
        // If we received exactly the limit, assume there might be more
        total:
          mightHaveMoreTokens && total <= loadedCount ? loadedCount + 1 : total,
        percentage:
          total > 0 && total > loadedCount
            ? Math.min(Math.round((loadedCount / total) * 100), 100)
            : mightHaveMoreTokens
            ? 99
            : 100, // If we might have more, show 99%
      })

      // Filter to only include fungible tokens
      const fungibleTokens = data.items.filter(
        (item: any) =>
          item.interface === 'FungibleToken' ||
          item.interface === 'FungibleAsset'
      ) as FungibleToken[]

      // Update tokens list
      if (resetData) {
        setAllTokens(fungibleTokens)
      } else {
        // Ensure we don't add duplicate tokens
        const newTokenIds = new Set(
          fungibleTokens.map((token: FungibleToken) => token.id)
        )
        const existingTokens = allTokens.filter(
          (token) => !newTokenIds.has(token.id)
        )
        setAllTokens([...existingTokens, ...fungibleTokens])
      }

      // Check if there are more tokens to load
      // If we received exactly the limit number of tokens, assume there might be more
      // even if the API reports total = limit
      const moreTokensAvailable = loadedCount < total || mightHaveMoreTokens
      setHasMoreTokens(moreTokensAvailable)

      // Update current page for next load
      if (!resetData) {
        setCurrentPage((prev) => prev + 1)
      } else {
        setCurrentPage(2) // Next page will be 2
      }

      // Auto-load next page if enabled and more tokens are available
      if (autoLoadAll && moreTokensAvailable && !resetData) {
        // Small delay to prevent overwhelming the API
        setTimeout(() => {
          fetchTokens(false)
        }, 500) // Increased delay to be more gentle with the API
      }
    } catch (error) {
      console.error(t('error.error_fetching_tokens'), error)
      setError(t('error.failed_to_fetch_tokens'))
      if (resetData) {
        setTokenData(undefined)
        setAllTokens([])
      }
    } finally {
      if (resetData) {
        setIsLoading(false)
      } else {
        setLoadingMore(false)
      }
    }
  }

  const loadMoreTokens = async () => {
    if (!hasMoreTokens || loadingMore) return
    await fetchTokens(false)
  }

  // Auto-load all tokens after initial fetch if autoLoadAll is enabled
  useEffect(() => {
    if (
      autoLoadAll &&
      hasMoreTokens &&
      !loadingMore &&
      !isLoading &&
      allTokens.length > 0
    ) {
      loadMoreTokens()
    }
  }, [hasMoreTokens, loadingMore, isLoading, allTokens.length, autoLoadAll])

  useEffect(() => {
    fetchTokens()
  }, [address])

  // All tokens are fungible tokens now
  const tokens = allTokens || []
  const fungibleTokens = tokens

  return {
    tokens,
    fungibleTokens,
    nativeBalance: tokenData?.nativeBalance,
    isLoading,
    error,
    refetch: () => fetchTokens(true),
    hasMoreTokens,
    loadMoreTokens,
    loadingMore,
    progress,
  }
}
