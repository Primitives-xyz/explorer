import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  SearchHistoryItem,
  getRecentSearches,
  addSearchToHistory,
} from '@/utils/searchHistory'
import { useApiVersion } from '@/hooks/use-api-version'

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([])
  const { useNewApi, setUseNewApi } = useApiVersion()
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

  // Save preference to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('useNewApi', useNewApi.toString())
    }
  }, [useNewApi])

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
    router.push(`/${searchInput}?useNewApi=${useNewApi}`)
    setIsOpen(false)
    setSearchInput('')
  }

  const handleRecentSearchClick = async (address: string) => {
    await addSearchToHistory(address)
    router.push(`/${address}?useNewApi=${useNewApi}`)
    setIsOpen(false)
    setSearchInput('')
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
                  placeholder="Search wallet address..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
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

              {/* API Version Toggle */}
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => setUseNewApi(!useNewApi)}
                  className={`px-3 py-1 text-xs font-mono border ${
                    useNewApi
                      ? 'border-green-500 text-green-400 bg-green-900/20'
                      : 'border-green-800/30 text-green-600'
                  } transition-colors hover:bg-green-900/30`}
                >
                  {useNewApi ? '[NEW API]' : '[OLD API]'}
                </button>
                <span className="text-xs text-green-600 font-mono">
                  Toggle API version
                </span>
              </div>
            </div>

            {/* Recent Searches */}
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
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
