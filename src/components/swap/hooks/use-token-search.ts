'use client'

import { usePortfolioData } from '@/components/profile/hooks/use-portfolio-data'
import {
  searchTokensByAddress,
  searchTokensByKeyword,
} from '@/components/swap/services/token-search-service'
import { ITokenSearchResult } from '@/components/swap/swap.models'
import { DEFAULT_TOKENS } from '@/components/swap/utils/token-utils'
import { useCurrentWallet } from '@/components/utils/use-current-wallet'
import { debounce } from 'lodash'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'

export enum SortOptionsDetails {
  MARKETCAP = 'marketcap',
  VOLUME = 'volume',
  NAME = 'name',
  BALANCE = 'balance',
}

export function useTokenSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ITokenSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verifiedOnly, setVerifiedOnly] = useState(true)

  const t = useTranslations()
  const { walletAddress } = useCurrentWallet()
  const { items, isLoading: isPortfolioLoading } = usePortfolioData({
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
    if (!items.length) return []

    return items.map((item) => ({
      name: item.name,
      symbol: item.symbol,
      address: item.address,
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
    }))
  }, [items]).filter((token) => token.name)

  // Process wallet tokens when they're available
  useEffect(() => {
    if (!searchQuery.trim()) {
      const newResults =
        walletAddress && walletTokens.length > 0 ? walletTokens : DEFAULT_TOKENS

      // Only update if the results are different
      if (JSON.stringify(newResults) !== JSON.stringify(searchResults)) {
        setSearchResults(newResults)
      }
      setIsLoading(false)
    }
  }, [walletAddress, walletTokens, searchQuery, searchResults])

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
        setSearchResults(results)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t('error.an_error_occurred')
        )
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
    isLoading: isLoading || isPortfolioLoading,
    error,
    verifiedOnly,
    sortOptions,
    sortBy,
    setSearchQuery,
    setVerifiedOnly,
    setSortBy,
  }
}
