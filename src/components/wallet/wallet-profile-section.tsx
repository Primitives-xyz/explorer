'use client'

import { Avatar } from '@/components/common/avatar'
import { FilterBar } from '@/components/common/filter-bar'
import { FilterButton } from '@/components/common/filter-button'
import { FollowButton } from '@/components/profile/follow-button'
import { useFollowStats } from '@/hooks/use-follow-stats'
import { EXPLORER_NAMESPACE } from '@/lib/constants'
import { handleProfileNavigation } from '@/utils/profile-navigation'
import { route } from '@/utils/routes'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { TokenAddress } from '../tokens/token-address'

// Match the Identity type from useIdentities hook
interface Identity {
  profile: {
    id: string
    created_at: number
    namespace: string
    username: string
    bio: string | null
    image: string | null
    blockchain: string
  }
  wallet: {
    address: string
  }
  namespace: {
    id: number
    name: string
    readableName: string
    faviconURL?: string | null
    createdAt: string
    updatedAt: string
    isDefault: boolean
    team_id: number
    userProfileURL: string
  }
}

interface WalletProfileSectionProps {
  walletAddress: string
  profiles: Identity[]
  isLoading: boolean
}

// Memoize the profile card component
const ProfileCard = memo(
  ({ profile, router }: { profile: Identity; router: any }) => {
    const { mainUsername } = useCurrentWallet()
    const isExplorerApp = profile.namespace?.name === EXPLORER_NAMESPACE

    const getReadableNamespace = (namespace: any) => {
      // Special cases for namespace display names
      const specialNames: Record<string, string> = {
        nemoapp: 'Explorer',
        farcaster_external: 'Farcaster',
        allDomains: 'All Domains',
      }

      return (
        specialNames[namespace.name] || namespace.readableName || namespace.name
      )
    }

    const { stats } = useFollowStats(
      isExplorerApp ? profile.profile.username : '',
      mainUsername || ''
    )

    // Move conditional logic after hook call
    const followers =
      isExplorerApp && typeof stats?.followers === 'number'
        ? stats.followers
        : 0
    const following =
      isExplorerApp && typeof stats?.following === 'number'
        ? stats.following
        : 0

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
          if (profile.namespace.name === 'nemoapp') {
            router.push(route('address', { id: profile.profile.username }))
          } else {
            router.push(
              route('namespace', { namespace: profile.namespace.name })
            )
          }
        } catch (error) {
          console.error('Error navigating to namespace:', error)
        }
      },
      [router, profile?.namespace?.name]
    )

    return (
      <div className="p-2 hover:bg-green-900/10">
        <div className="flex items-start gap-2 h-full">
          <div className="relative flex-shrink-0">
            <button
              onClick={() => handleProfileNavigation(profile, router)}
              className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-green-500/50 rounded-full"
              aria-label={`View ${profile.profile.username}'s profile`}
            >
              <Avatar
                username={profile.profile.username}
                size={36}
                imageUrl={profile.profile.image || undefined}
              />
            </button>
            {profile.namespace?.faviconURL &&
            profile.namespace?.name !== 'nemoapp' ? (
              <button
                onClick={handleNamespaceClick}
                className="absolute -bottom-1 -right-1 hover:scale-110 transition-transform"
              >
                <img
                  src={profile.namespace.faviconURL}
                  alt={profile.namespace.readableName}
                  className="w-4 h-4 rounded-full bg-black ring-1 ring-green-500/20"
                />
              </button>
            ) : profile.namespace?.faviconURL ? (
              <div className="absolute -bottom-1 -right-1">
                <img
                  src={profile.namespace.faviconURL}
                  alt={profile.namespace.readableName}
                  className="w-4 h-4 rounded-full bg-black ring-1 ring-green-500/20"
                />
              </div>
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1 w-3/5">
                  <button
                    onClick={handleProfileClick}
                    className="font-mono text-xs bg-green-900/20 py-0.5 px-1 rounded hover:bg-green-900/40 transition-colors font-bold truncate"
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
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-[10px]">Followers: {followers}</span>
                  <span className="text-[10px]">Following: {following}</span>
                </div>
              )}

              {profile.wallet?.address && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] opacity-60">address:</span>
                  <TokenAddress address={profile.wallet.address} />
                </div>
              )}

              {profile.namespace && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] opacity-50">
                    <button
                      onClick={handleNamespaceClick}
                      className="hover:opacity-80 transition-opacity"
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
  }
)

ProfileCard.displayName = 'ProfileCard'

export function WalletProfileSection({
  walletAddress,
  profiles,
  isLoading,
}: WalletProfileSectionProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(
    null
  )

  const getReadableNamespace = (namespace: any) => {
    // Special cases for namespace display names
    const specialNames: Record<string, string> = {
      nemoapp: 'Explorer',
      farcaster_external: 'Farcaster',
      allDomains: 'All Domains',
    }

    return (
      specialNames[namespace.name] || namespace.readableName || namespace.name
    )
  }

  // Memoize filtered profiles
  const filteredProfiles = useMemo(() => {
    if (!profiles || !Array.isArray(profiles)) return []
    if (!selectedNamespace) return profiles
    return profiles.filter(
      (profile) => profile?.namespace?.name === selectedNamespace
    )
  }, [profiles, selectedNamespace])

  // Memoize unique namespaces
  const namespaces = useMemo(() => {
    if (!profiles || !Array.isArray(profiles)) return []

    return Array.from(
      new Set(
        profiles
          .filter((p) => p?.namespace != null)
          .map((p) =>
            JSON.stringify({
              name: p.namespace.name,
              readableName: p.namespace.readableName,
              faviconURL: p.namespace.faviconURL,
            })
          )
      )
    ).map((str) => JSON.parse(str))
  }, [profiles])

  return (
    <div className="border-t border-green-800/30 pt-2">
      {/* Section Header */}
      <div className="px-2 mb-1 flex items-center justify-between">
        <div className="text-green-400 text-xs">
          <span className="mr-1">{'>'}</span> {t('profile_info')}
        </div>
        {filteredProfiles.length > 0 && (
          <div className="text-xs text-gray-400">{filteredProfiles.length}</div>
        )}
      </div>

      {/* Namespace Filters - Only show if we have multiple namespaces */}
      {namespaces.length > 1 && (
        <div className="px-2 mb-1">
          <FilterBar>
            <FilterButton
              label="All"
              isSelected={selectedNamespace === null}
              onClick={() => setSelectedNamespace(null)}
            />
            {namespaces.map((namespace) => (
              <FilterButton
                key={namespace.name}
                label={getReadableNamespace(namespace)}
                isSelected={selectedNamespace === namespace.name}
                onClick={() => setSelectedNamespace(namespace.name)}
                icon={namespace.faviconURL}
              />
            ))}
          </FilterBar>
        </div>
      )}

      {/* Profile List */}
      {isLoading ? (
        <div className="p-2">
          <div className="animate-pulse">
            <div className="h-3 bg-green-800/20 rounded w-1/2 mb-1"></div>
            <div className="h-3 bg-green-800/20 rounded w-3/4"></div>
          </div>
        </div>
      ) : !profiles || profiles.length === 0 ? (
        <div className="p-2 text-center text-xs opacity-70">
          {t('profile_info.no_profile_found')}
        </div>
      ) : (
        <div className=" overflow-y-auto">
          {filteredProfiles.map((profile) => (
            <ProfileCard
              key={`${profile.profile.username}-${profile.namespace?.name}`}
              profile={profile}
              router={router}
            />
          ))}
        </div>
      )}
    </div>
  )
}
