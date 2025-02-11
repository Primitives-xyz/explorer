import type { ProfileSearchResult } from '@/types'
import { route } from '@/utils/routes'
import {
  type SearchHistoryItem,
  addSearchToHistory,
  getRecentSearches,
} from '@/utils/searchHistory'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export function useProfileSearch() {
  const [searchInput, setSearchInput] = useState('')
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([])
  const [searchResults, setSearchResults] = useState<ProfileSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function loadRecentSearches() {
    try {
      const searches = await getRecentSearches()
      setRecentSearches(searches)
    } catch (error) {
      console.error('Failed to load recent searches:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchInput.trim()) return

    await addSearchToHistory(searchInput)
    router.push(route('address', { id: searchInput }))
    setSearchInput('')
  }

  const handleRecentSearchClick = async (address: string) => {
    await addSearchToHistory(address)
    router.push(route('address', { id: address }))
    setSearchInput('')
  }

  const searchProfiles = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(query)}`
      )
      const data = await response.json()
      setSearchResults(data.profiles)
    } catch (error) {
      console.error('Failed to search profiles:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput) {
        searchProfiles(searchInput)
      } else {
        setSearchResults([])
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchInput, searchProfiles])

  const handleInputChange = (value: string) => {
    setSearchInput(value)
  }

  return {
    searchInput,
    setSearchInput,
    recentSearches,
    searchResults,
    isLoading,
    loadRecentSearches,
    handleSearch,
    handleRecentSearchClick,
    handleInputChange,
  }
}
