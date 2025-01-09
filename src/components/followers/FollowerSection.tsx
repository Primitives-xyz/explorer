'use client'

import { useRouter } from 'next/navigation'
import { memo } from 'react'
import { Plus } from 'lucide-react'
import { TokenAddress } from '../tokens/TokenAddress'

interface Follower {
  id: string
  created_at: number
  namespace: string
  username: string
  bio: string | null
  wallet?: {
    id: string
    blockchain: string
  }
}

interface FollowerSectionProps {
  followers?: Follower[]
  isLoading?: boolean
  error?: string | null
  hideTitle?: boolean
}

// Memoize the follower card component for better performance
const FollowerCard = memo(
  ({ follower, router }: { follower: Follower; router: any }) => {
    const handleProfileClick = () => {
      router.push(`/${follower.username}`)
    }

    return (
      <div className="p-3 hover:bg-green-900/10 min-h-[85px]">
        <div className="flex items-start gap-3 h-full">
          <div className="relative flex-shrink-0">
            <img
              src={`https://api.dicebear.com/7.x/shapes/svg?seed=${follower.username}`}
              alt={follower.username}
              className="w-12 h-12 rounded-lg object-cover bg-black/40 ring-1 ring-green-500/20"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleProfileClick}
                    className="text-green-400 font-mono text-sm bg-green-900/20 px-2 py-1 rounded-lg hover:bg-green-900/40 transition-colors font-bold"
                  >
                    @{follower.username}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {follower.wallet?.id && (
                  <div className="flex items-center gap-1.5 bg-black/30 px-2 py-0.5 rounded-md">
                    <span className="text-green-600/60 text-xs">address:</span>
                    <TokenAddress address={follower.wallet.id} />
                  </div>
                )}
              </div>

              {follower.bio && (
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-mono text-xs truncate">
                    {follower.bio}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  },
)

FollowerCard.displayName = 'FollowerCard'

export const FollowerSection = ({
  followers = [],
  isLoading = false,
  error = null,
  hideTitle = false,
}: FollowerSectionProps) => {
  const router = useRouter()

  const shouldShowContent = isLoading || followers.length > 0

  if (!shouldShowContent) return null

  return (
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden flex flex-col  relative group">
      {/* Header */}
      {!hideTitle && (
        <div className="border-b border-green-800 p-4 flex-shrink-0 bg-black/20">
          <div className="flex justify-between items-center">
            <div className="text-green-500 text-sm font-mono flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {'>'} followers.sol
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-green-600 font-mono bg-green-900/20 px-3 py-1 rounded-full">
                COUNT: {followers?.length || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-2 mb-4 border border-red-800 bg-red-900/20 text-red-400 flex-shrink-0">
          <span>! ERROR: {error}</span>
        </div>
      )}

      {/* Scroll Indicators */}
      <div
        className="absolute right-1 top-[40px] bottom-1 w-1 opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: 0,
          animation: 'fadeOut 0.3s ease-out',
        }}
      >
        <div className="h-full bg-green-500/5 rounded-full">
          <div
            className="h-16 w-full bg-green-500/10 rounded-full"
            style={{
              animation: 'slideY 3s ease-in-out infinite',
              transformOrigin: 'top',
            }}
          />
        </div>
      </div>

      {/* Follower List */}
      <div
        className="divide-y divide-green-800/30 overflow-y-auto flex-grow scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-900/50 hover-scroll-indicator"
        onScroll={(e) => {
          const indicator = e.currentTarget.previousSibling as HTMLElement
          if (e.currentTarget.scrollTop > 0) {
            indicator.style.opacity = '1'
            indicator.style.animation = 'fadeIn 0.3s ease-out'
          } else {
            indicator.style.opacity = '0'
            indicator.style.animation = 'fadeOut 0.3s ease-out'
          }
        }}
      >
        {isLoading ? (
          <div className="p-8 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-green-600 font-mono animate-pulse">
              {'>>> FETCHING FOLLOWERS...'}
            </div>
          </div>
        ) : followers.length === 0 ? (
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> NO FOLLOWERS FOUND'}
          </div>
        ) : (
          followers.map((follower) => (
            <FollowerCard
              key={`${follower.id}-${follower.namespace}`}
              follower={follower}
              router={router}
            />
          ))
        )}
      </div>
    </div>
  )
}
