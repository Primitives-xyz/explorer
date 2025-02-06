'use client'

import { getProfiles, type Profile } from '@/utils/api'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { Modal } from './common/modal'
import { useFollowStats } from '@/hooks/use-follow-stats'
import { FollowButton } from './profile/follow-button'
import { useCurrentWallet } from './auth/hooks/use-current-wallet'
import { memo } from 'react'
import { TokenAddress } from './tokens/TokenAddress'
import { DataContainer } from './common/DataContainer'
import { ScrollableContent } from './common/ScrollableContent'
import { FilterBar } from './common/FilterBar'
import { FilterButton } from './common/FilterButton'
import { handleProfileNavigation } from '@/utils/profile-navigation'
import { EXPLORER_NAMESPACE } from '@/lib/constants'
import { Avatar } from './common/Avatar'

interface ProfileWithStats extends Profile {
  followStats?: {
    followers: number
    following: number
  }
}

interface ProfileData {
  profiles: any[]
}

interface ProfileSectionProps {
  walletAddress?: string
  hasSearched?: boolean
  profileData?: ProfileData | null
  error?: string | null
  isLoadingProfileData?: boolean
  title?: string
}

// Memoize the profile card component
const ProfileCard = memo(
  ({ profile, router }: { profile: ProfileWithStats; router: any }) => {
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
      mainUsername || '',
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
      handleProfileNavigation(profile, router)
    }, [profile, router])

    const handleNamespaceClick = useCallback(() => {
      router.push(`/namespace/${profile.namespace?.name}`)
    }, [router, profile.namespace?.name])

    return (
      <div className="p-3 hover:bg-green-900/10 min-h-[85px]">
        <div className="flex items-start gap-3 h-full">
          <div className="relative flex-shrink-0">
            <Avatar
              username={profile.profile.username}
              size={48}
              imageUrl={profile.profile.image}
            />
            {profile.namespace?.faviconURL && (
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
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleProfileClick}
                    className="text-green-400 font-mono text-sm bg-green-900/20 px-2 py-1 rounded-lg hover:bg-green-900/40 transition-colors font-bold"
                  >
                    @{profile.profile.username}
                  </button>
                  {isExplorerApp && (
                    <div className="flex items-center gap-2 text-xs text-green-600 font-mono">
                      <span>Followers: {followers}</span>
                      <span>Following: {following}</span>
                    </div>
                  )}
                </div>
                {profile.namespace?.name === EXPLORER_NAMESPACE && (
                  <div className="flex-shrink-0">
                    <FollowButton username={profile.profile.username} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {profile.wallet?.address && (
                  <div className="flex items-center gap-1.5 bg-black/30 px-2 py-0.5 rounded-md">
                    <span className="text-green-600/60 text-xs">address:</span>
                    <TokenAddress address={profile.wallet.address} />
                  </div>
                )}
              </div>

              {profile.profile.bio && (
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-mono text-xs truncate">
                    {profile.profile.bio}
                  </span>
                </div>
              )}

              {profile.namespace && (
                <div className="flex items-center gap-2">
                  <span className="text-green-600/50 text-xs">
                    <button
                      onClick={handleNamespaceClick}
                      className="hover:text-green-500 transition-colors"
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
  },
)

ProfileCard.displayName = 'ProfileCard'

export const ProfileSection = ({
  walletAddress,
  hasSearched,
  profileData,
  error: propError,
  isLoadingProfileData,
  title = 'profile_info',
}: ProfileSectionProps) => {
  const key = walletAddress || 'default'
  const router = useRouter()
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([])
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      (profile) => profile?.namespace?.name === selectedNamespace,
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
            }),
          ),
      ),
    ).map((str) => JSON.parse(str))
  }, [profiles])

  // Cleanup function to reset state
  const resetState = useCallback(() => {
    setProfiles([])
    setSelectedNamespace(null)
    setError(null)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Reset state on mount and cleanup on unmount
    resetState()
    return resetState
  }, [resetState])

  useEffect(() => {
    let isMounted = true

    const fetchProfiles = async () => {
      if (!walletAddress && !profileData && !hasSearched) return
      if (isLoadingProfileData) return

      // Reset state before fetching new data
      resetState()
      if (!isMounted) return

      setIsLoading(true)

      try {
        if (profileData && isMounted) {
          setProfiles(profileData.profiles)
        } else if (walletAddress && isMounted) {
          const profilesData = await getProfiles(walletAddress)

          if (!isMounted) return

          if (!profilesData.items || profilesData.items.length === 0) {
            setProfiles([])
            return
          }

          setProfiles(profilesData.items)
        }
      } catch (error) {
        console.error('Profiles fetch error:', error)
        if (isMounted) {
          setError(propError || 'Failed to fetch profiles.')
          setProfiles([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchProfiles()

    return () => {
      isMounted = false
    }
  }, [
    walletAddress,
    profileData,
    propError,
    hasSearched,
    isLoadingProfileData,
    resetState,
  ])

  const shouldShowContent =
    isLoadingProfileData ||
    (profiles && profiles.length > 0) ||
    (hasSearched && profiles && profiles.length === 0)

  if (!shouldShowContent) return null

  return (
    <DataContainer
      key={key}
      title={title}
      count={filteredProfiles?.length || 0}
      error={error}
      height="large"
      headerRight={
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-green-500/10 text-green-500 transition-colors"
        >
          <Plus size={16} />
        </button>
      }
    >
      {/* Domain Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Profile"
      >
        <div className="flex flex-col gap-3">
          <button
            onClick={() =>
              window.open('https://www.dotblink.me/search', '_blank')
            }
            className="w-full p-3 text-left bg-green-500/5 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors font-mono text-sm border border-green-500/20 hover:border-green-500/30"
          >
            Create A .Blink Profile
          </button>
          <button
            onClick={() => window.open('https://www.sns.id/', '_blank')}
            className="w-full p-3 text-left bg-green-500/5 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors font-mono text-sm border border-green-500/20 hover:border-green-500/30"
          >
            Create a .Sol Profile
          </button>
          <button
            onClick={() =>
              window.open('https://alldomains.id/buy-domain', '_blank')
            }
            className="w-full p-3 text-left bg-green-500/5 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors font-mono text-sm border border-green-500/20 hover:border-green-500/30"
          >
            Explore All Domains
          </button>
          <button
            onClick={() => window.open('https://www.tapaigames.com/', '_blank')}
            className="w-full p-3 text-left bg-green-500/5 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors font-mono text-sm border border-green-500/20 hover:border-green-500/30"
          >
            Create a Nimbus App
          </button>
        </div>
      </Modal>

      {/* Namespace Filters */}
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

      {/* Profile List */}
      <ScrollableContent
        isLoading={isLoading || isLoadingProfileData}
        isEmpty={filteredProfiles.length === 0}
        loadingText=">>> FETCHING PROFILES..."
        emptyText=">>> NO PROFILES FOUND"
      >
        <div className="divide-y divide-green-800/30">
          {filteredProfiles.map((profile) => (
            <ProfileCard
              key={`${profile.profile.username}-${profile.namespace?.name}`}
              profile={profile}
              router={router}
            />
          ))}
        </div>
      </ScrollableContent>
    </DataContainer>
  )
}
