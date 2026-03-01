'use client'

import {
  searchTokensByQuery,
  fetchTrendingTokens,
} from '@/components/swap/services/token-search-service'
import { ITokenSearchResult } from '@/components/swap/swap.models'
import { DEFAULT_TOKENS } from '@/components/swap/utils/token-utils'
import { SOL_MINT } from '@/utils/constants'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { debounce } from 'lodash'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'

export enum SortOptionsDetails {
  MARKETCAP = 'marketcap',
  VOLUME = 'volume',
  NAME = 'name',
  BALANCE = 'balance',
}

export const BAD_SOL_MINT = 'So11111111111111111111111111111111111111111'
export const GOOD_INPUT_SOL = SOL_MINT

const walletAssetsFetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) return null
  return res.json()
}

export function useTokenSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ITokenSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [trendingLoaded, setTrendingLoaded] = useState(false)
  const t = useTranslations()
  const { walletAddress } = useCurrentWallet()

  // Fetch wallet token holdings via Helius getAssetsByOwner
  const { data: walletAssetsData, isLoading: walletAssetsLoading } = useSWR(
    walletAddress
      ? `/api/wallets/getAssets/${walletAddress}?showFungible=true&showNativeBalance=true&limit=50`
      : null,
    walletAssetsFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      refreshInterval: 120000,
    }
  )

  const sortOptions = [
    { label: 'marketcap', value: SortOptionsDetails.MARKETCAP },
    { label: 'volume', value: SortOptionsDetails.VOLUME },
    { label: 'name', value: SortOptionsDetails.NAME },
    { label: 'balance', value: SortOptionsDetails.BALANCE },
  ]

  const [sortBy, setSortBy] = useState(SortOptionsDetails.MARKETCAP)

  // Map Helius wallet assets to our token format
  const walletTokens = useMemo(() => {
    if (!walletAssetsData?.items?.length) return []

    const nativeBalance = walletAssetsData.nativeBalance
    const tokens: ITokenSearchResult[] = []

    // Add SOL if native balance exists
    if (nativeBalance && nativeBalance.lamports > 0) {
      const solAmount = nativeBalance.lamports / 1e9
      tokens.push({
        name: 'Wrapped SOL',
        symbol: 'SOL',
        address: SOL_MINT,
        decimals: 9,
        logoURI: `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${SOL_MINT}/logo.png`,
        price: nativeBalance.price_per_sol || null,
        volume_24h_usd: 0,
        verified: true,
        market_cap: 0,
        uiAmount: solAmount,
        valueUsd: solAmount * (nativeBalance.price_per_sol || 0),
      })
    }

    // Add fungible tokens
    for (const item of walletAssetsData.items) {
      if (
        item.interface !== 'FungibleToken' &&
        item.interface !== 'FungibleAsset'
      )
        continue

      const tokenInfo = item.token_info
      if (!tokenInfo) continue

      let address = item.id
      if (address === BAD_SOL_MINT) {
        address = GOOD_INPUT_SOL
      }

      const decimals = tokenInfo.decimals || 0
      const balance = tokenInfo.balance || 0
      const uiAmount = balance / Math.pow(10, decimals)
      const pricePerToken = tokenInfo.price_info?.price_per_token || 0

      if (uiAmount <= 0) continue

      tokens.push({
        name: item.content?.metadata?.name || 'Unknown',
        symbol: item.content?.metadata?.symbol || '???',
        address,
        decimals,
        logoURI: item.content?.links?.image || item.content?.files?.[0]?.uri || '',
        price: pricePerToken || null,
        volume_24h_usd: 0,
        verified: true,
        market_cap: 0,
        uiAmount,
        valueUsd: uiAmount * pricePerToken,
      })
    }

    return tokens.sort((a, b) => (b.valueUsd || 0) - (a.valueUsd || 0))
  }, [walletAssetsData])

  // Load trending tokens as default when no wallet and no search
  useEffect(() => {
    if (!searchQuery.trim() && !walletAddress && !trendingLoaded) {
      setTrendingLoaded(true)
      fetchTrendingTokens('toptraded', '24h', 20).then((results) => {
        if (results.length > 0 && !searchQuery.trim()) {
          setSearchResults(results)
        }
      })
    }
  }, [searchQuery, walletAddress, trendingLoaded])

  // Show wallet tokens or defaults when no search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      if (walletAddress && walletTokens.length > 0) {
        setSearchResults(walletTokens)
      } else if (!trendingLoaded) {
        setSearchResults(DEFAULT_TOKENS)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletTokens, walletAddress, searchQuery])

  // Re-fetch when verifiedOnly changes during active search
  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedOnly])

  const prioritizeWalletTokens = useCallback(
    (results: ITokenSearchResult[], query: string): ITokenSearchResult[] => {
      if (!walletTokens.length) return results

      const matchingWalletTokens = walletTokens
        .filter(
          (token) =>
            token.name?.toLowerCase().includes(query.toLowerCase()) ||
            token.symbol?.toLowerCase().includes(query.toLowerCase())
        )
        .map((token) => ({ ...token, prioritized: true }))
        .sort((a, b) => (b.valueUsd || 0) - (a.valueUsd || 0))

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
      if (!query.trim()) return

      setIsLoading(true)
      setError(null)

      try {
        const results = await searchTokensByQuery(query)

        if (Array.isArray(results)) {
          const prioritized = prioritizeWalletTokens(results, query)
          setSearchResults(
            verifiedOnly
              ? prioritized.filter((t) => t.verified)
              : prioritized
          )
        } else {
          setSearchResults([])
        }
      } catch (err) {
        console.error('Error searching tokens:', err)
        setError(
          err instanceof Error ? err.message : t('error.an_error_occurred')
        )
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    },
    [verifiedOnly, t, prioritizeWalletTokens]
  )

  const debouncedSearch = useMemo(
    () => debounce(searchTokens, 300),
    [searchTokens]
  )

  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery)
    }
    return () => debouncedSearch.cancel()
  }, [searchQuery, debouncedSearch])

  return {
    searchQuery,
    searchResults,
    isLoading: isLoading || walletAssetsLoading,
    error,
    verifiedOnly,
    sortOptions,
    sortBy,
    setSearchQuery,
    setVerifiedOnly,
    setSortBy,
  }
}
