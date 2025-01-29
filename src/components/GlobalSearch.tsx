import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  SearchHistoryItem,
  getRecentSearches,
  addSearchToHistory,
} from '@/utils/searchHistory'
import { ProfileSearchResult } from '@/types'
import { handleProfileNavigation } from '@/utils/profile-navigation'

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([])
  const [searchResults, setSearchResults] = useState<ProfileSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadRecentSearches()
    }
  }, [isOpen])

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
    router.push(`/${searchInput}`)
    setIsOpen(false)
    setSearchInput('')
  }

  const handleRecentSearchClick = async (address: string) => {
    await addSearchToHistory(address)
    router.push(`/${address}`)
    setIsOpen(false)
    setSearchInput('')
  }

  const searchProfiles = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(query)}`,
      )
      const data = await response.json()
      setSearchResults(data.profiles)
    } catch (error) {
      console.error('Failed to search profiles:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    setSearchInput(value)
    searchProfiles(value)
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl my-16 text-left align-middle transition-all transform">
          <div className="relative bg-black border border-green-800 shadow-xl">
            {/* Search Input */}
            <div className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-mono">$</span>
                <input
                  type="text"
                  autoFocus
                  placeholder="Search username or wallet address..."
                  value={searchInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                  className="flex-1 bg-transparent font-mono text-green-400 placeholder-green-800 
                           focus:outline-none focus:ring-0 border-none text-sm"
                />
                <div className="text-xs text-green-800 font-mono">
                  ESC to close
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="border-t border-green-800">
                <div className="p-4 text-center text-green-600 font-mono text-sm">
                  {'>>> SEARCHING...'}
                </div>
              </div>
            )}

            {/* Profile Search Results */}
            {!isLoading && searchResults.length > 0 && (
              <div className="border-t border-green-800">
                <div className="p-2 text-xs text-green-600 font-mono border-b border-green-800/30">
                  PROFILE MATCHES
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.map((profile) => (
                    <div
                      key={profile.profile.id}
                      onClick={() => {
                        handleProfileNavigation(profile, router)
                        setIsOpen(false)
                      }}
                      className="p-2 hover:bg-green-900/20 cursor-pointer border-b border-green-800/30 
                               last:border-b-0 flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-green-900/20" />
                      <div className="flex-1">
                        <div className="font-mono text-green-400 text-sm">
                          {profile.profile.username}
                        </div>
                        <div className="text-green-600 text-xs flex justify-between">
                          <span>{profile.namespace.readableName}</span>
                          <span>
                            {profile.socialCounts.followers} followers ·{' '}
                            {profile.socialCounts.following} following
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {!isLoading && searchResults.length === 0 && (
              <div className="border-t border-green-800">
                <div className="p-2 text-xs text-green-600 font-mono border-b border-green-800/30">
                  Recent Searches
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {recentSearches.length > 0 ? (
                    recentSearches.map((search) => (
                      <div
                        key={search.walletAddress}
                        onClick={() =>
                          handleRecentSearchClick(search.walletAddress)
                        }
                        className="p-2 hover:bg-green-900/20 cursor-pointer border-b border-green-800/30 
                                 last:border-b-0"
                      >
                        <div className="font-mono text-green-400 text-sm">
                          {search.walletAddress}
                        </div>
                        <div className="text-green-600 text-xs">
                          {new Date(search.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-green-600 font-mono text-sm">
                      {'>>> NO SEARCH HISTORY <<<'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
