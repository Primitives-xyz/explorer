'use client'

import { DataContainer } from '@/components/common/data-container'
import {
  ProfileData as HookProfileData,
  useProfileData,
} from '@/hooks/use-profile-data'
import { ProfileSectionProps } from '@/types/profile'
import { extractUniqueNamespaces } from '@/utils/namespace-utils'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { NamespaceFilters } from './profile/namespace-filters'
import { ProfileCreationModal } from './profile/profile-creation-modal'
import { ProfileList } from './profile/profile-list'

export const ProfileSection = ({
  walletAddress,
  hasSearched,
  profileData,
  error: propError,
  isLoadingProfileData = false,
  title = 'profile_info',
}: ProfileSectionProps) => {
  const key = walletAddress || 'default'
  const router = useRouter()
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Convert profileData to the format expected by the hook
  const hookProfileData = profileData
    ? ({
        profiles: profileData.profiles,
        totalCount: profileData.totalCount,
      } as HookProfileData)
    : null

  // Use the custom hook for profile data
  const { profiles, isLoading, error } = useProfileData({
    walletAddress,
    profileData: hookProfileData,
    hasSearched,
    isLoadingProfileData,
    propError,
  })

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
    return extractUniqueNamespaces(profiles)
  }, [profiles])

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
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-green-500/10 transition-colors"
        >
          <Plus size={16} />
        </button>
      }
    >
      {/* Domain Creation Modal */}
      <ProfileCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Namespace Filters */}
      <NamespaceFilters
        namespaces={namespaces}
        selectedNamespace={selectedNamespace}
        onNamespaceSelect={setSelectedNamespace}
      />

      {/* Profile List */}
      <ProfileList
        profiles={filteredProfiles}
        isLoading={isLoading || !!isLoadingProfileData}
      />
    </DataContainer>
  )
}
