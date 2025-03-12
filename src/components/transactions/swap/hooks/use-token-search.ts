'use client'

import { useWallet } from '@/components/auth/wallet-context'
import { usePortfolioData } from '@/hooks/usePortfolioData'
import { debounce } from 'lodash'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import {
  searchTokensByAddress,
  searchTokensByKeyword,
} from '../services/token-search-service'
import { SortOption, TokenSearchResult } from '../types/token-types'
import { DEFAULT_TOKENS } from '../utils/token-utils'

export function useTokenSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] =
    useState<TokenSearchResult[]>(DEFAULT_TOKENS)
  const [isLoading, setIsLoading] = useState(false)
  const [isWalletTokensLoading, setIsWalletTokensLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verifiedOnly, setVerifiedOnly] = useState(true)
  const [isGlobalSearchActive, setIsGlobalSearchActive] = useState(false)
  const { walletAddress } = useWallet()
  const { items } = usePortfolioData(walletAddress)
  const t = useTranslations()
  const initialLoadComplete = useRef(false)

  // Set wallet tokens loading state when wallet address changes
  useEffect(() => {
    if (walletAddress && !initialLoadComplete.current) {
      setIsWalletTokensLoading(true)
    }
  }, [walletAddress])

  // Process wallet tokens if wallet address exists and items are loaded
  useEffect(() => {
    // If no wallet address, just use default tokens and mark initial load as complete
    if (!walletAddress) {
      setSearchResults(DEFAULT_TOKENS)
      initialLoadComplete.current = true
      setIsWalletTokensLoading(false)
      return
    }

    // If we have wallet items, process them
    if (items.length > 0) {
      console.log(items)
      const walletTokens = items.map((item) => ({
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

      setSearchResults(walletTokens)
      initialLoadComplete.current = true
      setIsWalletTokensLoading(false)
    }
  }, [walletAddress, items])

  const sortOptions: SortOption[] = [
    {
      value: 'marketcap',
      label: t('trade.marketcap'),
    },
    {
      value: 'volume',
      label: t('common.volume'),
    },
    {
      value: 'name',
      label: t('trade.name'),
    },
    {
      value: 'balance',
      label: t('common.balance') || 'Balance',
    },
  ]

  const [sortBy, setSortBy] = useState(sortOptions[0])

  const searchTokens = async (query: string) => {
    if (!query.trim()) {
      // When clearing search, show wallet tokens if available, otherwise default tokens
      if (walletAddress && items.length > 0) {
        // Don't do anything, keep the current wallet tokens
        setIsLoading(false)
        return
      } else {
        setSearchResults(DEFAULT_TOKENS)
        setIsLoading(false)
        return
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      // First try to get token by address if the query looks like a Solana address
      if (query.length === 44 || query.length === 43) {
        const token = await searchTokensByAddress(query)
        if (token) {
          setSearchResults([token])
          setIsLoading(false)
          return
        }
      }

      // If not found by address or not an address, use keyword search
      const results = await searchTokensByKeyword(query, verifiedOnly)

      // Prioritize tokens from the wallet
      const prioritizedResults = prioritizeWalletTokens(results, items, query)

      setSearchResults(prioritizedResults)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('error.an_error_occurred')
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Function to prioritize wallet tokens in search results
  const prioritizeWalletTokens = (
    searchResults: TokenSearchResult[],
    walletItems: any[], // Using any[] since we don't have the exact type
    query: string
  ): TokenSearchResult[] => {
    if (!walletItems.length) return searchResults

    // Create a map of wallet token addresses for quick lookup
    const walletTokensMap = new Map()

    // Convert wallet items to TokenSearchResult format and store in map
    walletItems.forEach((item) => {
      // Only include tokens that match the search query
      const nameMatch = item.name?.toLowerCase().includes(query.toLowerCase())
      const symbolMatch = item.symbol
        ?.toLowerCase()
        .includes(query.toLowerCase())

      if (nameMatch || symbolMatch) {
        walletTokensMap.set(item.address, {
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
          valueUsd: item.valueUsd || 0,
          volume_24h_usd: 0,
          verified: true,
          market_cap: 0,
          prioritized: true,
        })
      }
    })

    // Filter out wallet tokens from search results to avoid duplicates
    const filteredResults = searchResults.filter(
      (token) => !walletTokensMap.has(token.address)
    )

    // Get wallet tokens that match the search query
    const matchingWalletTokens = Array.from(walletTokensMap.values())

    // Sort wallet tokens by valueUsd in descending order
    const sortedWalletTokens = matchingWalletTokens.sort(
      (a, b) => (b.valueUsd || 0) - (a.valueUsd || 0)
    )

    // Combine sorted wallet tokens with filtered search results
    return [...sortedWalletTokens, ...filteredResults]
  }

  useEffect(() => {
    const handleGlobalSearch = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        setIsGlobalSearchActive(true)
      }
    }

    const handleGlobalSearchClose = () => {
      setIsGlobalSearchActive(false)
    }

    window.addEventListener('keydown', handleGlobalSearch)
    window.addEventListener('globalSearchClose', handleGlobalSearchClose)

    return () => {
      window.removeEventListener('keydown', handleGlobalSearch)
      window.removeEventListener('globalSearchClose', handleGlobalSearchClose)
    }
  }, [])

  const debouncedSearch = debounce(searchTokens, 300)

  useEffect(() => {
    debouncedSearch(searchQuery)
    return () => debouncedSearch.cancel()
  }, [searchQuery, verifiedOnly])

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading: isLoading || isWalletTokensLoading,
    error,
    verifiedOnly,
    setVerifiedOnly,
    sortOptions,
    sortBy,
    setSortBy,
    isGlobalSearchActive,
  }
}
