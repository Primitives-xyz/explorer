'use client'

import { useState, useCallback, memo } from 'react'
import { Card } from '../common/card'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { ProfileSection } from '../ProfileSection'
import { SocialSection } from '../social/SocialSection'
import { Modal } from '../common/modal'
import { CommentWall } from './CommentWall'
import { ProfileInfo } from './ProfileInfo'
import { UpdateProfileModal } from './update-profile-modal'
import { ProfileHeader } from './profile-header'
import { ProfileStats } from './profile-stats'
import { useProfileData } from '@/hooks/use-profile-data'

interface Props {
  username: string
}

// Memoize the modals to prevent unnecessary rerenders
const SocialModal = memo(function SocialModal({
  isOpen,
  onClose,
  title,
  users,
  isLoading,
  type,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  users: any[]
  isLoading: boolean
  type: 'followers' | 'following'
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <SocialSection users={users} isLoading={isLoading} type={type} />
    </Modal>
  )
})

// Memoize the error card to prevent unnecessary rerenders
const ErrorCard = memo(function ErrorCard() {
  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-mono text-red-400 mb-4">Profile Error</h3>
        <p className="text-red-500 font-mono text-sm">
          Invalid wallet address associated with this profile. Some features may
          be limited.
        </p>
      </div>
    </Card>
  )
})

export function ProfileContent({ username }: Props) {
  const { mainUsername } = useCurrentWallet()
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  const {
    profileData,
    profiles,
    followers,
    following,
    comments,
    isLoading,
    isLoadingFollowers,
    isLoadingFollowing,
    isLoadingComments,
    walletAddressError,
    serverError,
  } = useProfileData(username, mainUsername)

  const handleEditProfile = useCallback(() => {
    setShowUpdateModal(true)
  }, [])

  const handleFollowersClick = useCallback(() => {
    setShowFollowersModal(true)
  }, [])

  const handleFollowingClick = useCallback(() => {
    setShowFollowingModal(true)
  }, [])

  const handleCloseFollowers = useCallback(() => {
    setShowFollowersModal(false)
  }, [])

  const handleCloseFollowing = useCallback(() => {
    setShowFollowingModal(false)
  }, [])

  const handleCloseUpdate = useCallback(() => {
    setShowUpdateModal(false)
  }, [])

  const handleProfileUpdated = useCallback(() => {
    window.location.reload()
  }, [])

  if (serverError) {
    window.location.href = '/'
    throw new Error('Server error')
  }

  const isOwnProfile = mainUsername === username

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ProfileHeader
        username={username}
        profileData={profileData}
        isLoading={isLoading}
        walletAddressError={walletAddressError}
        onEditProfile={handleEditProfile}
        isOwnProfile={isOwnProfile}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProfileStats
            profileData={profileData}
            isLoading={isLoading}
            onFollowersClick={handleFollowersClick}
            onFollowingClick={handleFollowingClick}
          />

          <CommentWall
            username={username}
            isLoading={isLoadingComments}
            comments={comments}
          />
        </div>

        <div className="space-y-6">
          {walletAddressError ? (
            <ErrorCard />
          ) : (
            profileData && <ProfileInfo profileData={profileData} />
          )}

          <ProfileSection
            walletAddress={profileData?.walletAddress}
            hasSearched={!isLoading}
            isLoadingProfileData={isLoading}
            profileData={{ profiles: profiles || [] }}
            title="related_profiles"
          />
        </div>
      </div>

      {/* Modals */}
      <SocialModal
        isOpen={showFollowersModal}
        onClose={handleCloseFollowers}
        title={`@${username}'s Followers`}
        users={followers}
        isLoading={isLoadingFollowers}
        type="followers"
      />

      <SocialModal
        isOpen={showFollowingModal}
        onClose={handleCloseFollowing}
        title={`@${username}'s Following`}
        users={following}
        isLoading={isLoadingFollowing}
        type="following"
      />

      <UpdateProfileModal
        isOpen={showUpdateModal}
        onClose={handleCloseUpdate}
        currentUsername={username}
        currentBio={profileData?.profile.bio}
        currentImage={profileData?.profile.image}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  )
}
