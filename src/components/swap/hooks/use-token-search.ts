'use client'

import { useGetProfilePortfolio } from '@/components/birdeye/hooks/use-get-profile-portfolio'
import {
  searchTokensByAddress,
  searchTokensByKeyword,
} from '@/components/swap/services/token-search-service'
import { ITokenSearchResult } from '@/components/swap/swap.models'
import { DEFAULT_TOKENS } from '@/components/swap/utils/token-utils'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { debounce } from 'lodash'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'

export enum SortOptionsDetails {
  MARKETCAP = 'marketcap',
  VOLUME = 'volume',
  NAME = 'name',
  BALANCE = 'balance',
}

export const BAD_SOL_MINT = 'So11111111111111111111111111111111111111111'
export const GOOD_INPUT_SOL = 'So11111111111111111111111111111111111111112'

export function useTokenSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ITokenSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verifiedOnly, setVerifiedOnly] = useState(true)
  const t = useTranslations()
  const { walletAddress } = useCurrentWallet()
  const { data, loading: getProfilePortfolioLoading } = useGetProfilePortfolio({
    walletAddress,
  })

  const sortOptions = [
    { label: 'marketcap', value: SortOptionsDetails.MARKETCAP },
    { label: 'volume', value: SortOptionsDetails.VOLUME },
    { label: 'name', value: SortOptionsDetails.NAME },
    { label: 'balance', value: SortOptionsDetails.BALANCE },
  ]

  const [sortBy, setSortBy] = useState(SortOptionsDetails.MARKETCAP)

  // Convert wallet items to token format
  const walletTokens = useMemo(() => {
    if (!data?.data?.items?.length) return []

    return data.data.items.map((item) => {
      let address = item.address
      if (address === BAD_SOL_MINT) {
        address = GOOD_INPUT_SOL
      }

      return {
        name: item.name,
        symbol: item.symbol,
        address: address,
        decimals: item.decimals,
        logoURI: item.logoURI || item.icon,
        icon: item.icon,
        chainId: item.chainId,
        price: item.priceUsd,
        priceUsd: item.priceUsd,
        balance: item.balance,
        uiAmount: item.uiAmount,
        valueUsd: item.valueUsd,
        volume_24h_usd: 0,
        verified: true,
        market_cap: 0,
      }
    })
  }, [data]).filter((token) => token.name)

  // Process wallet tokens when they're available
  useEffect(() => {
    // Reset the state when verifiedOnly changes to prevent potential issues
    // with invalid tokens causing errors
    if (!searchQuery.trim()) {
      const newResults =
        walletAddress && walletTokens.length > 0 ? walletTokens : DEFAULT_TOKENS

      // Only update if the results are different
      if (JSON.stringify(newResults) !== JSON.stringify(searchResults)) {
        setSearchResults(newResults)
      }
    } else {
      // Re-fetch results when verifiedOnly changes
      debouncedSearch(searchQuery)
    }
  }, [verifiedOnly])

  // Function to prioritize wallet tokens in search results
  const prioritizeWalletTokens = useCallback(
    (results: ITokenSearchResult[], query: string): ITokenSearchResult[] => {
      if (!walletTokens.length) return results

      // Get wallet tokens that match the search query
      const matchingWalletTokens = walletTokens
        .filter(
          (token) =>
            token.name?.toLowerCase().includes(query.toLowerCase()) ||
            token.symbol?.toLowerCase().includes(query.toLowerCase())
        )
        .map((token) => ({ ...token, prioritized: true }))
        .sort((a, b) => (b.valueUsd || 0) - (a.valueUsd || 0))

      // Filter out wallet tokens from search results to avoid duplicates
      const walletAddresses = new Set(
        matchingWalletTokens.map((t) => t.address)
      )
      const filteredResults = results.filter(
        (token) => !walletAddresses.has(token.address)
      )

      return [...matchingWalletTokens, ...filteredResults]
    },
    [walletTokens]
  )

  const searchTokens = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        return // Early return as the useEffect will handle empty query state
      }

      setIsLoading(true)
      setError(null)

      try {
        // First try to get token by address if the query looks like a Solana address
        if (query.length === 44 || query.length === 43) {
          const token = await searchTokensByAddress(query)
          if (token) {
            setSearchResults([token])
            return
          }
        }

        // If not found by address or not an address, use keyword search
        const results = await searchTokensByKeyword(query, verifiedOnly)
        if (Array.isArray(results)) {
          setSearchResults(results)
        } else {
          setSearchResults([])
        }
      } catch (err) {
        console.error('Error searching tokens:', err)
        setError(
          err instanceof Error ? err.message : t('error.an_error_occurred')
        )
        setSearchResults([]) // Set empty results on error to prevent UI issues
      } finally {
        setIsLoading(false)
      }
    },
    [verifiedOnly, t]
  )

  const debouncedSearch = useMemo(
    () => debounce(searchTokens, 300),
    [searchTokens]
  )

  useEffect(() => {
    debouncedSearch(searchQuery)
    return () => debouncedSearch.cancel()
  }, [searchQuery, debouncedSearch])

  return {
    searchQuery,
    searchResults,
    isLoading: isLoading || getProfilePortfolioLoading,
    error,
    verifiedOnly,
    sortOptions,
    sortBy,
    setSearchQuery,
    setVerifiedOnly,
    setSortBy,
  }
}
