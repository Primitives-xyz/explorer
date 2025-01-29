import { ProfileSearchResult } from '@/types'
import { SearchHistoryItem } from '@/utils/searchHistory'
import { handleProfileNavigation } from '@/utils/profile-navigation'
import { useRouter } from 'next/navigation'

interface SearchResultsProps {
  isLoading: boolean
  searchResults: ProfileSearchResult[]
  recentSearches: SearchHistoryItem[]
  onRecentSearchClick: (address: string) => void
  className?: string
}

export function SearchResults({
  isLoading,
  searchResults,
  recentSearches,
  onRecentSearchClick,
  className = '',
}: SearchResultsProps) {
  const router = useRouter()

  const handleProfileClick = (profile: ProfileSearchResult) => {
    handleProfileNavigation(
      {
        namespace: {
          name: 'nemoapp', // Since this is our app's namespace
          userProfileURL: undefined,
        },
        profile: {
          username: profile.profile.username,
        },
      },
      router,
    )
  }

  if (isLoading) {
    return (
      <div
        className={`p-4 text-center text-green-600 font-mono text-sm ${className}`}
      >
        {'>>> SEARCHING...'}
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Profile Search Results */}
      {searchResults.length > 0 && (
        <div className="border-b border-green-800/30">
          <div className="p-2 text-xs text-green-600 font-mono bg-green-900/20">
            PROFILE MATCHES
          </div>
          {searchResults.map((profile) => (
            <div
              key={profile.profile.id}
              onClick={() => handleProfileClick(profile)}
              className="p-2 hover:bg-green-900/20 cursor-pointer border-b border-green-800/30 
                       last:border-b-0 backdrop-blur-sm bg-black/95 flex items-center gap-3"
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
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div>
          <div className="p-2 text-xs text-green-600 font-mono bg-green-900/20">
            RECENT SEARCHES
          </div>
          {recentSearches.map((search) => (
            <div
              key={search.walletAddress}
              onClick={() => onRecentSearchClick(search.walletAddress)}
              className="p-2 hover:bg-green-900/20 cursor-pointer border-b border-green-800/30 
                       last:border-b-0 backdrop-blur-sm bg-black/95"
            >
              <div className="font-mono text-green-400 text-sm">
                {search.walletAddress}
              </div>
              <div className="text-green-600 text-xs">
                {new Date(search.timestamp).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {searchResults.length === 0 && recentSearches.length === 0 && (
        <div className="p-4 text-center text-green-600 font-mono text-sm backdrop-blur-sm bg-black/95">
          {'>>> NO RESULTS FOUND <<<'}
        </div>
      )}
    </div>
  )
}
