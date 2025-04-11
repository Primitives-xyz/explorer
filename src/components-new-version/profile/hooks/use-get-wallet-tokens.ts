import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { IFungibleToken } from '../profile.models'

interface TokenData {
  items: IFungibleToken[]
  nativeBalance: {
    lamports: number
    price_per_sol: number
    total_price: number
  }
  total: number
  page: number
  limit: number
}

interface TokenFetcherResult {
  tokenData: TokenData | undefined
  tokens: IFungibleToken[]
  nativeBalance:
    | {
        lamports: number
        price_per_sol: number
        total_price: number
      }
    | undefined
  isLoading: boolean
  error: string | undefined
  fetchTokens: (page: number, limit: number) => Promise<void>
  resetTokens: () => Promise<void>
}

/**
 * Base hook for fetching token data for a wallet address
 */
export function useTokenFetcher(address: string): TokenFetcherResult {
  const [tokenData, setTokenData] = useState<TokenData | undefined>(undefined)
  const [tokens, setTokens] = useState<IFungibleToken[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const t = useTranslations()

  const fetchTokens = useCallback(
    async (page: number, limit: number) => {
      if (!address) return

      setIsLoading(true)
      setError(undefined)

      try {
        console.log(`Fetching tokens: page ${page}, limit ${limit}`)

        const response = await fetch(
          `/api/tokens?address=${address}&type=fungible&limit=${limit}&page=${page}`
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
          `Received ${data.items?.length || 0} tokens, total: ${
            data.total || 0
          }`
        )

        // Update token data
        setTokenData(data)

        // Filter to only include fungible tokens
        const fungibleTokens = data.items.filter(
          (item: any) =>
            item.interface === 'FungibleToken' ||
            item.interface === 'FungibleAsset'
        ) as IFungibleToken[]

        setTokens(fungibleTokens)
      } catch (error) {
        console.error(t('error.error_fetching_tokens'), error)
        setError(t('error.failed_to_fetch_tokens'))
        setTokenData(undefined)
        setTokens([])
      } finally {
        setIsLoading(false)
      }
    },
    [address, t]
  )

  const resetTokens = useCallback(async () => {
    setTokens([])
    setTokenData(undefined)
    await fetchTokens(1, 250) // Default to page 1 with 250 tokens
  }, [fetchTokens])

  // Initial fetch on address change
  useEffect(() => {
    resetTokens()
  }, [address, resetTokens])

  return {
    tokenData,
    tokens,
    nativeBalance: tokenData?.nativeBalance,
    isLoading,
    error,
    fetchTokens,
    resetTokens,
  }
}

interface UseWalletTokensResult {
  tokens: IFungibleToken[]
  fungibleTokens: IFungibleToken[]
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

interface Props {
  walletAddress: string
  autoLoadAll?: boolean
}

/**
 * Higher-level hook for fetching all token data for a wallet address with pagination
 */
export function useGetWalletTokens({
  walletAddress,
  autoLoadAll = false,
}: Props): UseWalletTokensResult {
  const {
    tokens: baseTokens,
    nativeBalance,
    isLoading: isBaseLoading,
    error,
    fetchTokens,
    resetTokens,
  } = useTokenFetcher(walletAddress)

  const [allTokens, setAllTokens] = useState<IFungibleToken[]>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreTokens, setHasMoreTokens] = useState(false)
  const [progress, setProgress] = useState({
    loaded: 0,
    total: 0,
    percentage: 0,
  })

  // Increase page size to fetch more tokens at once
  const TOKENS_PER_PAGE = 250 // Maximum allowed by Helius API

  // Update allTokens when baseTokens change (initial load)
  useEffect(() => {
    if (baseTokens.length > 0 && currentPage === 1) {
      setAllTokens(baseTokens)

      // Check if there might be more tokens to load
      const mightHaveMoreTokens = baseTokens.length === TOKENS_PER_PAGE
      setHasMoreTokens(mightHaveMoreTokens)

      // Update progress
      setProgress({
        loaded: baseTokens.length,
        total: mightHaveMoreTokens ? baseTokens.length + 1 : baseTokens.length,
        percentage: mightHaveMoreTokens ? 99 : 100,
      })

      setCurrentPage(2) // Next page will be 2
    }
  }, [baseTokens, currentPage])

  const loadMoreTokens = useCallback(async () => {
    if (!hasMoreTokens || loadingMore || isBaseLoading) return

    setLoadingMore(true)

    try {
      await fetchTokens(currentPage, TOKENS_PER_PAGE)

      // Update tokens list with new tokens
      const newTokens = baseTokens

      // Ensure we don't add duplicate tokens
      const newTokenIds = new Set(
        newTokens.map((token: IFungibleToken) => token.id)
      )
      const existingTokens = allTokens.filter(
        (token) => !newTokenIds.has(token.id)
      )

      const updatedTokens = [...existingTokens, ...newTokens]
      setAllTokens(updatedTokens)

      // Check if there are more tokens to load
      // If we received exactly the limit number of tokens, assume there might be more
      const mightHaveMoreTokens = newTokens.length === TOKENS_PER_PAGE
      setHasMoreTokens(mightHaveMoreTokens)

      // Update progress
      const loadedCount = updatedTokens.length
      setProgress({
        loaded: loadedCount,
        total: mightHaveMoreTokens ? loadedCount + 1 : loadedCount,
        percentage: mightHaveMoreTokens ? 99 : 100,
      })

      // Update current page for next load
      setCurrentPage((prev) => prev + 1)
    } finally {
      setLoadingMore(false)
    }
  }, [
    hasMoreTokens,
    loadingMore,
    isBaseLoading,
    fetchTokens,
    currentPage,
    baseTokens,
    allTokens,
  ])

  // Auto-load all tokens after initial fetch if autoLoadAll is enabled
  useEffect(() => {
    if (
      autoLoadAll &&
      hasMoreTokens &&
      !loadingMore &&
      !isBaseLoading &&
      allTokens.length > 0
    ) {
      loadMoreTokens()
    }
  }, [
    hasMoreTokens,
    loadingMore,
    isBaseLoading,
    allTokens.length,
    autoLoadAll,
    loadMoreTokens,
  ])

  const refetch = useCallback(async () => {
    setCurrentPage(1)
    setAllTokens([])
    setHasMoreTokens(false)
    setProgress({ loaded: 0, total: 0, percentage: 0 })
    await resetTokens()
  }, [resetTokens])

  // All tokens are fungible tokens now
  const tokens = allTokens || []
  const fungibleTokens = tokens

  return {
    tokens,
    fungibleTokens,
    nativeBalance,
    isLoading: isBaseLoading && currentPage === 1,
    error,
    refetch,
    hasMoreTokens,
    loadMoreTokens,
    loadingMore,
    progress,
  }
}
