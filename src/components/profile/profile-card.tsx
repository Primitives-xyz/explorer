import { Avatar } from '@/components/common/avatar'
import { FollowButton } from '@/components/profile/follow-button'
import { TokenAddress } from '@/components/tokens/token-address'
import { useFollowStats } from '@/hooks/use-follow-stats'
import { type Profile } from '@/utils/api'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { getReadableNamespace } from '@/utils/namespace-utils'
import { handleProfileNavigation } from '@/utils/profile-navigation'
import { route } from '@/utils/routes'
import { useRouter } from 'next/navigation'
import { memo, useCallback } from 'react'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'

export interface ProfileWithStats extends Profile {
  followStats?: {
    followers: number
    following: number
  }
}

interface ProfileCardProps {
  profile: ProfileWithStats
}

export const ProfileCard = memo(({ profile }: ProfileCardProps) => {
  const router = useRouter()
  const { mainUsername } = useCurrentWallet()
  const isExplorerApp = profile.namespace?.name === EXPLORER_NAMESPACE

  const { stats } = useFollowStats(
    isExplorerApp ? profile.profile.username : '',
    mainUsername || ''
  )

  // Move conditional logic after hook call
  const followers =
    isExplorerApp && typeof stats?.followers === 'number' ? stats.followers : 0
  const following =
    isExplorerApp && typeof stats?.following === 'number' ? stats.following : 0

  const handleProfileClick = useCallback(() => {
    if (!profile) return // Add guard clause
    try {
      handleProfileNavigation(profile, router)
    } catch (error) {
      console.error('Error navigating to profile:', error)
    }
  }, [profile, router])

  const handleNamespaceClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation() // Prevent event bubbling
      if (!profile?.namespace?.name) return // Add guard clause

      try {
        if (profile.namespace.name === EXPLORER_NAMESPACE) {
          router.push(route('address', { id: profile.profile.username }))
        } else {
          router.push(route('namespace', { namespace: profile.namespace.name }))
        }
      } catch (error) {
        console.error('Error navigating to namespace:', error)
      }
    },
    [router, profile?.namespace?.name]
  )

  return (
    <div className="p-3 hover:bg-green-900/10 min-h-[85px]">
      <div className="flex items-start gap-3 h-full">
        <div className="relative flex-shrink-0">
          <button
            onClick={handleProfileClick}
            className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-green-500/50 rounded-full"
            aria-label={`View ${profile.profile.username}'s profile`}
          >
            <Avatar
              username={profile.profile.username}
              size={48}
              imageUrl={profile.profile.image}
            />
          </button>
          {profile.namespace?.faviconURL &&
          profile.namespace?.name !== EXPLORER_NAMESPACE ? (
            <button
              onClick={handleNamespaceClick}
              className="absolute -bottom-1.5 -right-1.5 hover:scale-110 transition-transform"
            >
              <img
                src={profile.namespace.faviconURL}
                alt={profile.namespace.readableName}
                className="w-5 h-5 rounded-full bg-black ring-1 ring-green-500/20"
              />
            </button>
          ) : profile.namespace?.faviconURL ? (
            <div className="absolute -bottom-1.5 -right-1.5">
              <img
                src={profile.namespace.faviconURL}
                alt={profile.namespace.readableName}
                className="w-5 h-5 rounded-full bg-black ring-1 ring-green-500/20"
              />
            </div>
          ) : null}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 w-3/5">
                <button
                  onClick={handleProfileClick}
                  className=" font-mono text-sm bg-green-900/20 py-1 rounded-lg hover:bg-green-900/40 transition-colors font-bold truncate"
                >
                  @{profile.profile.username}
                </button>
              </div>
              {profile.namespace?.name === EXPLORER_NAMESPACE && (
                <div className="flex-shrink-0">
                  <FollowButton username={profile.profile.username} />
                </div>
              )}
            </div>

            {isExplorerApp && (
              <div className="flex items-center gap-2 text-xs  font-mono">
                <span>Followers: {followers}</span>
                <span>Following: {following}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {profile.wallet?.address && (
                <div className="flex items-center gap-1.5 bg-black/30 py-0.5 rounded-md">
                  <span className="/60 text-xs">address:</span>
                  <TokenAddress address={profile.wallet.address} />
                </div>
              )}
            </div>

            {profile.profile.bio && (
              <div className="flex items-center gap-2">
                <span className=" font-mono text-xs truncate">
                  {profile.profile.bio}
                </span>
              </div>
            )}

            {profile.namespace && (
              <div className="flex items-center gap-2">
                <span className=" text-xs">
                  <button
                    onClick={handleNamespaceClick}
                    className="hover: transition-colors"
                  >
                    {getReadableNamespace(profile.namespace)}
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

ProfileCard.displayName = 'ProfileCard'
