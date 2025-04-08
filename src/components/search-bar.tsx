'use client'

import type { ProfileSearchResult } from '@/types'
import { handleProfileNavigation } from '@/utils/profile-navigation'
import { route } from '@/utils/routes'
import {
  type SearchHistoryItem,
  addSearchToHistory,
  getRecentSearches,
} from '@/utils/searchHistory'
import { Coins, Loader2, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { type ChangeEvent, useEffect, useRef, useState } from 'react'
import { TokenAddress } from './tokens/token-address'

interface TokenSearchResult {
  name: string
  symbol: string
  address: string
  decimals: number
  logoURI?: string
  price: number | null
  volume_24h_usd: number
  verified: boolean
  market_cap: number
}

interface SearchBarProps {
  onPickRecentAddress?: (addr: string) => void
  autoFocus?: boolean
  onSelectToken?: (token: TokenSearchResult) => void
  variant?: 'home' | 'inline'
}

type SearchTab = 'all' | 'profiles' | 'tokens' | 'recent'

type SearchItem =
  | { type: 'profile'; data: ProfileSearchResult }
  | { type: 'token'; data: TokenSearchResult }
  | { type: 'recent'; data: SearchHistoryItem }

export default function SearchBar({
  onPickRecentAddress,
  onSelectToken,
  autoFocus,
}: SearchBarProps) {
  const router = useRouter()
  const [inputValue, setInputValue] = useState('')
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchResults, setSearchResults] = useState<ProfileSearchResult[]>([])
  const [tokenResults, setTokenResults] = useState<TokenSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [activeTab, setActiveTab] = useState<SearchTab>('all')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const t = useTranslations()

  const MAX_ITEMS_IN_ALL_TAB = 3

  useEffect(() => {
    // Load recent searches
    loadRecentSearches()

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !searchBarRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  async function loadRecentSearches() {
    try {
      const searches = await getRecentSearches()
      setRecentSearches(searches)
    } catch (error) {
      console.error('Failed to load recent searches:', error)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (inputValue) {
      setIsNavigating(true)
      // On form submit, we call handleSearch from props
      await addSearchToHistory(inputValue)
      await loadRecentSearches()
      setShowDropdown(false)

      // Add navigation
      router.push(route('address', { id: inputValue }))
      // We'll let the navigation complete before closing
      // The loading state will show in the meantime
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setShowDropdown(true)
    setIsNavigating(false)
    searchProfiles(value)
  }

  const searchProfiles = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      setTokenResults([])
      return
    }

    setIsLoading(true)
    try {
      // Search profiles
      const profileResponse = await fetch(
        `/api/search?query=${encodeURIComponent(query)}`
      )
      const profileData = await profileResponse.json()
      setSearchResults(profileData.profiles)

      // Search tokens
      const tokenResponse = await fetch(
        `https://public-api.birdeye.so/defi/v3/search?chain=solana&keyword=${encodeURIComponent(
          query
        )}&target=token&sort_by=marketcap&sort_type=desc&verify_token=true&offset=0&limit=5`,
        {
          headers: {
            'X-API-KEY': 'ce36cc09be9d41d68f9fd4c45346c9f3',
            accept: 'application/json',
          },
        }
      )
      const tokenData = await tokenResponse.json()
      if (tokenData.success && tokenData.data?.items?.[0]?.result) {
        const mappedTokens = tokenData.data.items[0].result
          .filter((item: any) => item.symbol && item.name && item.decimals)
          .map((item: any) => ({
            address: item.address,
            symbol: item.symbol || 'Unknown',
            name: item.name || 'Unknown Token',
            decimals: item.decimals,
            logoURI: item.logo_uri,
            price: item.price,
            volume_24h_usd: item.volume_24h_usd || 0,
            verified: item.verified || false,
            market_cap: item.market_cap || 0,
          }))
        setTokenResults(mappedTokens)
      }
    } catch (error) {
      console.error('Failed to search:', error)
      setSearchResults([])
      setTokenResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatMarketCap = (marketCap: number | null) => {
    if (!marketCap) return ''
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`
    return `$${marketCap.toFixed(2)}`
  }

  const formatPrice = (price: number | null) => {
    if (!price) return ''
    if (price < 0.000001) return `$${price.toExponential(4)}`
    return `$${price.toLocaleString(undefined, {
      maximumFractionDigits: 6,
      minimumFractionDigits: 2,
    })}`
  }

  // Get all visible items based on current tab
  const getVisibleItems = (): SearchItem[] => {
    let currentIndex = 0

    switch (activeTab) {
      case 'profiles':
        return searchResults.map((item) => ({
          type: 'profile' as const,
          data: item,
          sectionIndex: currentIndex++,
        }))
      case 'tokens':
        return tokenResults.map((item) => ({
          type: 'token' as const,
          data: item,
          sectionIndex: currentIndex++,
        }))
      case 'recent':
        return recentSearches.map((item) => ({
          type: 'recent' as const,
          data: item,
          sectionIndex: currentIndex++,
        }))
      case 'all':
      default:
        return [
          ...searchResults.map((item) => ({
            type: 'profile' as const,
            data: item,
            sectionIndex: currentIndex++,
          })),
          ...tokenResults.map((item) => ({
            type: 'token' as const,
            data: item,
            sectionIndex: currentIndex++,
          })),
          ...recentSearches.map((item) => ({
            type: 'recent' as const,
            data: item,
            sectionIndex: currentIndex++,
          })),
        ]
    }
  }

  // Function to generate unique keys
  const getUniqueKey = (
    type: string,
    id: string,
    section: string,
    index: number
  ) => {
    return `${type}-${id}-${section}-${index}`
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showDropdown) return

      const items = getVisibleItems()

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < items.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < items.length) {
            const selectedItem = items[selectedIndex]
            if (!selectedItem) return

            switch (selectedItem.type) {
              case 'profile': {
                const profileData = selectedItem.data as ProfileSearchResult
                handleProfileNavigation(profileData, router)
                break
              }
              case 'token': {
                const tokenData = selectedItem.data as TokenSearchResult
                handleTokenClick(tokenData)
                break
              }
              case 'recent': {
                const recentData = selectedItem.data as SearchHistoryItem
                handleRecentSearchClick(recentData.walletAddress)
                break
              }
            }
            setShowDropdown(false)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    showDropdown,
    selectedIndex,
    activeTab,
    searchResults,
    tokenResults,
    recentSearches,
  ])

  // Reset selected index when tab changes
  useEffect(() => {
    setSelectedIndex(-1)
  }, [activeTab])

  const handleRecentSearchClick = async (address: string) => {
    setShowDropdown(false)
    setInputValue(address)
    setIsNavigating(true)

    try {
      // Save to history first
      await addSearchToHistory(address)
      await loadRecentSearches()

      // If parent gave us a direct callback, call it
      if (onPickRecentAddress) {
        onPickRecentAddress(address)
        return // Don't navigate if we have a callback
      }

      // Navigate
      router.push(route('address', { id: address }))
    } catch (error) {
      console.error(error)
      setIsNavigating(false)
    }
  }

  const handleTokenClick = async (token: TokenSearchResult) => {
    try {
      // Add to search history before handling the selection
      await addSearchToHistory(token.address)
      await loadRecentSearches()
      setShowDropdown(false)

      if (onSelectToken) {
        onSelectToken(token)
      } else {
        router.push(route('address', { id: token.address }))
      }
    } catch (error) {
      console.error('Failed to handle token selection:', error)
    }
  }

  const renderDropdown = () => {
    if (!showDropdown) return null

    const hasProfiles = searchResults.length > 0
    const hasTokens = tokenResults.length > 0
    const hasRecent = recentSearches.length > 0

    return (
      <div className="absolute left-0 right-0 top-full mt-1 z-50">
        <div className="relative">
          <div
            className="w-full text-left align-middle transition-all transform"
            ref={dropdownRef}
          >
            {/* Tabs */}
            <div className="flex border-b border-green-800/30 bg-black/95 backdrop-blur-xs">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 p-2 text-xs font-mono transition-colors uppercase
                          ${
                            activeTab === 'all'
                              ? 'bg-green-900/40  border-b-2 border-green-500'
                              : ' hover:bg-green-900/20'
                          }`}
              >
                {t('search_bar.all')}{' '}
                {hasProfiles || hasTokens || hasRecent ? '•' : ''}
              </button>
              <button
                onClick={() => setActiveTab('profiles')}
                className={`uppercase flex-1 p-2 text-xs font-mono transition-colors flex items-center justify-center gap-2
                          ${
                            activeTab === 'profiles'
                              ? 'bg-green-900/40  border-b-2 border-green-500'
                              : ' hover:bg-green-900/20'
                          }`}
              >
                <Users className="w-3 h-3" />
                {t('search_bar.profiles')} {hasProfiles ? '•' : ''}
              </button>
              <button
                onClick={() => setActiveTab('tokens')}
                className={`uppercase flex-1 p-2 text-xs font-mono transition-colors flex items-center justify-center gap-2
                          ${
                            activeTab === 'tokens'
                              ? 'bg-green-900/40  border-b-2 border-green-500'
                              : ' hover:bg-green-900/20'
                          }`}
              >
                <Coins className="w-3 h-3" />
                {t('common.tokens')} {hasTokens ? '•' : ''}
              </button>
              {hasRecent && (
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`uppercase flex-1 p-2 text-xs font-mono transition-colors
                            ${
                              activeTab === 'recent'
                                ? 'bg-green-900/40  border-b-2 border-green-500'
                                : ' hover:bg-green-900/20'
                            }`}
                >
                  {t('search_bar.recent')}
                </button>
              )}
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto bg-black/95 backdrop-blur-xs divide-y divide-green-800/30">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin " />
                </div>
              ) : (
                <>
                  {/* Show relevant results based on active tab */}
                  {(activeTab === 'all' || activeTab === 'profiles') &&
                    searchResults.length > 0 && (
                      <div className="divide-y divide-green-800/30">
                        {activeTab === 'all' && (
                          <div className="p-2 text-xs  font-mono bg-green-900/20 flex justify-between items-center">
                            <span className="uppercase">
                              {t('search_bar.profile_matches')}
                            </span>
                            {searchResults.length > MAX_ITEMS_IN_ALL_TAB && (
                              <button
                                onClick={() => setActiveTab('profiles')}
                                className=" hover:"
                              >
                                +{searchResults.length - MAX_ITEMS_IN_ALL_TAB}{' '}
                                {t('search_bar.more')}
                              </button>
                            )}
                          </div>
                        )}
                        {(activeTab === 'all'
                          ? searchResults.slice(0, MAX_ITEMS_IN_ALL_TAB)
                          : searchResults
                        ).map((profile, index) => (
                          <div
                            key={getUniqueKey(
                              'profile',
                              `${profile.namespace.name}-${profile.profile.id}`,
                              activeTab,
                              index
                            )}
                            onClick={() =>
                              handleProfileNavigation(profile, router)
                            }
                            className={`p-2 hover:bg-green-900/20 cursor-pointer backdrop-blur-xs bg-black/95 
                                     flex items-center gap-3 ${
                                       selectedIndex === index
                                         ? 'bg-green-900/40'
                                         : ''
                                     }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-green-900/20 relative overflow-hidden">
                              {profile.profile.image && (
                                <img
                                  src={profile.profile.image}
                                  alt={`${profile.profile.id} profile image`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-mono  text-sm flex items-center gap-2">
                                {profile.profile.username}
                                {profile.walletAddress && (
                                  <TokenAddress
                                    address={profile.walletAddress}
                                  />
                                )}
                              </div>
                              <div className=" text-xs flex justify-between">
                                <span className="flex space-x-2">
                                  {profile.namespace.faviconURL && (
                                    <div className="w-4 h-4 rounded-full bg-green-900/20 relative overflow-hidden">
                                      <Image
                                        src={profile.namespace.faviconURL}
                                        alt={`${profile.namespace.readableName} icon`}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                  <span>{profile.namespace.readableName}</span>
                                </span>
                                <span>
                                  {profile.socialCounts.followers}{' '}
                                  {t('common.followers')} ·{' '}
                                  {profile.socialCounts.following}{' '}
                                  {t('common.following')}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {(activeTab === 'all' || activeTab === 'tokens') &&
                    tokenResults.length > 0 && (
                      <div className="divide-y divide-green-800/30">
                        {activeTab === 'all' && (
                          <div className="p-2 text-xs  font-mono bg-green-900/20 flex justify-between items-center">
                            <span className="uppercase">
                              {t('search_bar.token_matches')}
                            </span>
                            {tokenResults.length > MAX_ITEMS_IN_ALL_TAB && (
                              <button
                                onClick={() => setActiveTab('tokens')}
                                className=" hover:"
                              >
                                +{tokenResults.length - MAX_ITEMS_IN_ALL_TAB}{' '}
                                {t('search_bar.more')}
                              </button>
                            )}
                          </div>
                        )}
                        {(activeTab === 'all'
                          ? tokenResults.slice(0, MAX_ITEMS_IN_ALL_TAB)
                          : tokenResults
                        ).map((token, index) => (
                          <div
                            key={getUniqueKey(
                              'token',
                              token.address,
                              activeTab,
                              index +
                                (activeTab === 'all' ? searchResults.length : 0)
                            )}
                            onClick={() => handleTokenClick(token)}
                            className={`p-2 hover:bg-green-900/20 cursor-pointer backdrop-blur-xs 
                                     bg-black/95 flex items-center gap-3 ${
                                       selectedIndex ===
                                       (activeTab === 'all'
                                         ? index + searchResults.length
                                         : index)
                                         ? 'bg-green-900/40'
                                         : ''
                                     }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-green-900/20 relative overflow-hidden">
                              {token.logoURI ? (
                                <Image
                                  src={token.logoURI}
                                  alt={`${token.symbol} logo`}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center ">
                                  {token.symbol.slice(0, 2)}
                                </div>
                              )}
                              {token.verified && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center ring-1 ring-black">
                                  <span className="text-black text-xs">✓</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium ">
                                  {token.symbol}
                                </span>
                                <span className="/80 text-sm truncate">
                                  {token.name}
                                </span>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <div className="text-sm /90 font-medium">
                                  {formatPrice(token.price)}
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span>
                                    {t('common.m_cap')}:{' '}
                                    {formatMarketCap(token.market_cap)}
                                  </span>
                                  {token.volume_24h_usd > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>
                                        {t('common.vol')}: $
                                        {(token.volume_24h_usd / 1e6).toFixed(
                                          2
                                        )}
                                        {t('common.m')}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {(activeTab === 'all' || activeTab === 'recent') &&
                    recentSearches.length > 0 && (
                      <div>
                        {activeTab === 'all' && (
                          <div className="p-2 text-xs  font-mono bg-green-900/20 flex justify-between items-center">
                            <span className="uppercase">
                              {t('search_bar.recent_searches')}
                            </span>
                            {recentSearches.length > MAX_ITEMS_IN_ALL_TAB && (
                              <button
                                onClick={() => setActiveTab('recent')}
                                className=" hover:"
                              >
                                +{recentSearches.length - MAX_ITEMS_IN_ALL_TAB}{' '}
                                {t('search_bar.more')}
                              </button>
                            )}
                          </div>
                        )}
                        {(activeTab === 'all'
                          ? recentSearches.slice(0, MAX_ITEMS_IN_ALL_TAB)
                          : recentSearches
                        ).map((search, index) => (
                          <div
                            key={getUniqueKey(
                              'recent',
                              search.walletAddress,
                              activeTab,
                              index +
                                (activeTab === 'all'
                                  ? searchResults.length + tokenResults.length
                                  : 0)
                            )}
                            onClick={() =>
                              handleRecentSearchClick(search.walletAddress)
                            }
                            className={`p-2 hover:bg-green-900/20 cursor-pointer backdrop-blur-xs 
                                     bg-black/95 flex items-center gap-3 ${
                                       selectedIndex ===
                                       (activeTab === 'all'
                                         ? index +
                                           searchResults.length +
                                           tokenResults.length
                                         : index)
                                         ? 'bg-green-900/40'
                                         : ''
                                     }`}
                          >
                            <div className="font-mono  text-sm">
                              {search.walletAddress}
                            </div>
                            <div className=" text-xs">
                              {new Date(search.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto mb-2 sm:mb-4">
      <div className=" text-[10px] sm:text-xs mb-1 sm:mb-2 font-mono px-2 sm:px-0">
        <p>
          <span className="opacity-60 uppercase">
            {t('search_bar.system')}:
          </span>{' '}
          {t('search_bar.search_username')}
        </p>
      </div>

      <div className="relative pb-4 sm:pb-8">
        <form onSubmit={handleSubmit} className="relative">
          <div
            ref={searchBarRef}
            className="relative flex items-center gap-1 sm:gap-2 bg-black/30 border border-green-800 p-1 sm:p-2"
          >
            <span className=" font-mono text-sm">$</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="BprhcaJtUTER4e3ArG..."
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setShowDropdown(true)}
              disabled={isNavigating}
              className="flex-1 bg-transparent font-mono  placeholder-green-800 
                       focus:outline-hidden focus:ring-0 border-none text-xs sm:text-sm min-w-0
                       disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!inputValue || isNavigating}
              className="uppercase px-2 sm:px-4 py-1 font-mono text-xs sm:text-sm border border-green-600 
                       hover:bg-green-900/20 disabled:opacity-50 disabled:hover:bg-transparent
                       transition-colors duration-150 whitespace-nowrap"
            >
              {isNavigating
                ? `[${t('common.loading')}...]`
                : `[${t('search_bar.execute')}]`}
            </button>
          </div>

          {renderDropdown()}

          <div className="absolute mt-1 sm:mt-2 left-0 right-0 text-[10px] sm:text-xs font-mono">
            {isNavigating ? (
              <span className=" animate-pulse">
                {`>>>`} {t('search_bar.navigating_to')} {inputValue.slice(0, 8)}
                ...
              </span>
            ) : inputValue ? (
              <span className="">
                {`>>>`} {t('search_bar.ready_to_analyze')}{' '}
                {inputValue.slice(0, 8)}
                ...
              </span>
            ) : (
              <span className="">
                {`>>>`}_ {t('search_bar.awaiting_input')}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
