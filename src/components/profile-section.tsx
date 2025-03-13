'use client'

import { DataContainer } from '@/components/common/data-container'
import { FilterBar } from '@/components/common/filter-bar'
import { FilterButton } from '@/components/common/filter-button'
import { Modal } from '@/components/common/modal'
import { ScrollableContent } from '@/components/common/scrollable-content'
import { ProfileCard } from '@/components/profile-card'
import {
  IGetProfileResponse,
  INameSpace,
  IProfilesListResponse,
} from '@/types/profile.types'
import { getProfiles } from '@/utils/api'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface Props {
  walletAddress?: string
  hasSearched?: boolean
  profileData?: IProfilesListResponse
  error?: string | null
  isLoadingProfileData?: boolean
  title?: string
}

export const getReadableNamespace = (namespace?: INameSpace) => {
  if (!namespace) return ''
  const specialNames: Record<string, string> = {
    nemoapp: 'Explorer',
    farcaster_external: 'Farcaster',
    allDomains: 'All Domains',
  }
  return (
    specialNames[namespace.name] || namespace.readableName || namespace.name
  )
}

export function ProfileSection({
  walletAddress,
  hasSearched,
  profileData,
  error: propError,
  isLoadingProfileData,
  title = 'profile_info',
}: Props) {
  const key = walletAddress || 'default'
  const [profiles, setProfiles] = useState<IGetProfileResponse[]>([])
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const t = useTranslations()

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
      count={profileData?.totalCount ?? filteredProfiles?.length ?? 0}
      error={error}
      height="large"
      headerRight={
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-green-500/10  transition-colors"
        >
          <Plus size={16} />
        </button>
      }
    >
      {/* Domain Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('profile_info.create_new_profile')}
      >
        <div className="flex flex-col gap-3">
          <button
            onClick={() =>
              window.open('https://www.dotblink.me/search', '_blank')
            }
            className="w-full p-3 text-left bg-green-500/5 hover:bg-green-500/10  rounded-lg transition-colors font-mono text-sm border border-green-500/20 hover:border-green-500/30"
          >
            {t('profile_info.create_a_blink_profile')}
          </button>
          <button
            onClick={() => window.open('https://www.sns.id/', '_blank')}
            className="w-full p-3 text-left bg-green-500/5 hover:bg-green-500/10  rounded-lg transition-colors font-mono text-sm border border-green-500/20 hover:border-green-500/30"
          >
            {t('profile_info.create_a_sol_profile')}
          </button>
          <button
            onClick={() =>
              window.open('https://alldomains.id/buy-domain', '_blank')
            }
            className="w-full p-3 text-left bg-green-500/5 hover:bg-green-500/10  rounded-lg transition-colors font-mono text-sm border border-green-500/20 hover:border-green-500/30"
          >
            {t('profile_info.explore_all_domains')}
          </button>
        </div>
      </Modal>

      {/* Namespace Filters */}
      <FilterBar>
        <FilterButton
          label={t('common.all')}
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
        loadingText={t('profile_info.fetching_profiles')}
        emptyText={t('profile_info.no_profile_found')}
      >
        <div className="divide-y divide-green-800/30">
          {filteredProfiles.map((profile) => (
            <ProfileCard
              key={`${profile.profile.username}-${profile.namespace?.name}`}
              profileAll={profile}
            />
          ))}
        </div>
      </ScrollableContent>
    </DataContainer>
  )
}
