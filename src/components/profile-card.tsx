'use client'

import { Avatar } from '@/components/common/avatar'
import { getReadableNamespace } from '@/components/profile-section'
import { FollowButton } from '@/components/profile/follow-button'
import { useFollowStats } from '@/hooks/use-follow-stats'
import { IGetProfileResponse, IProfile } from '@/types/profile.types'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { handleProfileNavigation } from '@/utils/profile-navigation'
import { route } from '@/utils/routes'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { memo, useCallback } from 'react'
import { useCurrentWallet } from './auth/hooks/use-current-wallet'
import { TokenAddress } from './tokens/token-address'

interface Props {
  profileAll?: IGetProfileResponse
  profile?: IProfile
}

export const ProfileCard = memo(({ profileAll, profile }: Props) => {
  const { mainUsername } = useCurrentWallet()
  const router = useRouter()

  const currentProfile = profileAll?.profile || profile
  const currentNamespace = profileAll?.namespace
  const walletAddress = profileAll?.wallet?.address

  const { stats } = useFollowStats(
    currentProfile?.username || '',
    mainUsername || ''
  )

  const isExplorerApp =
    currentNamespace?.name === EXPLORER_NAMESPACE ||
    profile?.namespace === EXPLORER_NAMESPACE

  const followers = isExplorerApp ? stats?.followers ?? 0 : 0
  const following = isExplorerApp ? stats?.following ?? 0 : 0

  const handleProfileClick = useCallback(() => {
    try {
      if (profileAll) {
        handleProfileNavigation(profileAll, router)
      } else if (currentProfile) {
        router.push(route('address', { id: currentProfile.username }))
      }
    } catch (error) {
      console.error('Error navigating to profile:', error)
    }
  }, [profileAll, currentProfile?.username, router])

  const handleNamespaceClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!currentNamespace?.name) return

      try {
        if (currentNamespace.name === EXPLORER_NAMESPACE && currentProfile) {
          router.push(route('address', { id: currentProfile.username }))
        } else {
          router.push(route('namespace', { namespace: currentNamespace.name }))
        }
      } catch (error) {
        console.error('Error navigating to namespace:', error)
      }
    },
    [router, currentNamespace?.name, currentProfile?.username]
  )

  return (
    <div className="p-3 hover:bg-green-900/10 min-h-[85px]">
      <div className="flex items-start gap-3 h-full">
        <div className="relative shrink-0">
          <button
            onClick={currentProfile ? handleProfileClick : undefined}
            className="hover:opacity-80 transition-opacity focus:outline-hidden focus:ring-2 focus:ring-green-500/50 rounded-full"
            aria-label={
              currentProfile
                ? `View ${currentProfile.username}'s profile`
                : 'View profile'
            }
            disabled={!currentProfile}
          >
            <Avatar
              username={currentProfile?.username || ''}
              size={48}
              imageUrl={currentProfile?.image}
            />
          </button>
          {currentNamespace?.faviconURL &&
          currentNamespace?.name !== EXPLORER_NAMESPACE ? (
            <button
              onClick={handleNamespaceClick}
              className="absolute -bottom-1.5 -right-1.5 hover:scale-110 transition-transform"
            >
              <Image
                src={currentNamespace.faviconURL}
                alt={currentNamespace.readableName}
                width={20}
                height={20}
                className="rounded-full bg-black ring-1 ring-green-500/20"
                unoptimized
              />
            </button>
          ) : currentNamespace?.faviconURL ? (
            <div className="absolute -bottom-1.5 -right-1.5">
              <Image
                src={currentNamespace.faviconURL}
                alt={currentNamespace.readableName}
                width={20}
                height={20}
                className="rounded-full bg-black ring-1 ring-green-500/20"
              />
            </div>
          ) : null}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 w-3/5">
                {currentProfile ? (
                  <button
                    onClick={handleProfileClick}
                    className="font-mono text-sm bg-green-900/20 py-1 rounded-lg hover:bg-green-900/40 transition-colors font-bold truncate"
                  >
                    @{currentProfile.username}
                  </button>
                ) : (
                  <span className="font-mono text-sm bg-gray-500/20 py-1 rounded-lg opacity-50 cursor-not-allowed">
                    Unknown
                  </span>
                )}
              </div>

              {isExplorerApp && currentProfile && (
                <div className="shrink-0">
                  <FollowButton username={currentProfile.username} />
                </div>
              )}
            </div>

            {isExplorerApp && (
              <div className="flex items-center gap-2 text-xs font-mono">
                <span>Followers: {followers}</span>
                <span>Following: {following}</span>
              </div>
            )}

            {walletAddress && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-black/30 py-0.5 rounded-md">
                  <span className="/60 text-xs">address:</span>
                  <TokenAddress address={walletAddress} />
                </div>
              </div>
            )}

            {currentProfile?.bio && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs truncate">
                  {currentProfile.bio}
                </span>
              </div>
            )}

            {currentNamespace && (
              <div className="flex items-center gap-2">
                <span className="text-xs">
                  <button
                    onClick={handleNamespaceClick}
                    className="hover: transition-colors"
                  >
                    {getReadableNamespace(currentNamespace)}
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
