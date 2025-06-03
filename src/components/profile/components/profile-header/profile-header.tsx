'use client'

import { FollowBlinkButton } from '@/components/common/follow-blink-button'
import { FollowButton } from '@/components/common/follow-button'
import { SolidScoreProfileHeader } from '@/components/profile/components/profile-header/solid-score-profile-header'
import { SolidScoreSmartCtaWrapper } from '@/components/solid-score/components/smart-cta/solid-score-smart-cta-wrapper'
import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { IGetProfileResponse } from '@/components/tapestry/models/profiles.models'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isSpecialUser } from '@/utils/user-permissions'
import { abbreviateWalletAddress } from '@/utils/utils'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ProfileEditableField } from '../profile-editable-field'
import { ProfileFollowersModal } from '../profile-followers-modal'
import { ProfileImageEditor } from '../profile-image-editor'
import { UsernameChangeModal } from '../username-change-modal'

interface Props {
  profileInfo?: IGetProfileResponse
  walletAddress?: string
}

export function ProfileHeader({ profileInfo, walletAddress }: Props) {
  const { mainProfile } = useCurrentWallet()
  const t = useTranslations()
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<'followers' | 'following'>(
    'followers'
  )

  // Editing states
  const [editingBio, setEditingBio] = useState(false)
  const [editingUsername, setEditingUsername] = useState(false)
  const [showUsernameWarning, setShowUsernameWarning] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [pendingUsername, setPendingUsername] = useState('')

  const hasProfile = !!profileInfo
  const username = hasProfile ? profileInfo.profile.username : walletAddress
  const bio = hasProfile ? profileInfo.profile.bio : undefined
  const imageUrl = hasProfile ? profileInfo.profile.image : undefined
  const creationYear =
    hasProfile && profileInfo.profile.created_at
      ? new Date(profileInfo.profile.created_at).getFullYear()
      : new Date().getFullYear()
  const isSame = hasProfile
    ? profileInfo.profile.username === profileInfo.walletAddress
    : false
  const followers = hasProfile ? profileInfo.socialCounts?.followers ?? 0 : 0
  const following = hasProfile ? profileInfo.socialCounts?.following ?? 0 : 0

  // Check if this is the current user's profile
  const isOwnProfile =
    hasProfile && mainProfile?.username === profileInfo.profile.username

  const { updateProfile, loading: updateLoading } = useUpdateProfile({
    username: profileInfo?.profile.username || '',
  })
  const { refetch: refetchCurrentUser } = useCurrentWallet()

  // Bio editing handlers
  const handleBioSave = async (newBio: string) => {
    try {
      await updateProfile({ bio: newBio })
      await refetchCurrentUser()
      setEditingBio(false)
    } catch (error) {
      console.error('Failed to update bio:', error)
    }
  }

  // Username editing handlers
  const handleUsernameSave = async (newUsername: string) => {
    if (newUsername !== profileInfo?.profile.username) {
      setPendingUsername(newUsername)
      setUsernameError('')
      setShowUsernameWarning(true)
      setEditingUsername(false)
    }
  }

  const confirmUsernameSave = async () => {
    try {
      await updateProfile({ username: pendingUsername })
      await refetchCurrentUser()
      setShowUsernameWarning(false)
      setUsernameError('')

      // 🔥 Navigate to the new username URL - MAGIC MOMENT!
      router.push(`/${pendingUsername}`)
    } catch (error: any) {
      console.error('Failed to update username:', error)
      setUsernameError(error)
    }
  }

  const handleUsernameModalCancel = () => {
    setShowUsernameWarning(false)
    setUsernameError('')
    setPendingUsername('')
  }

  return (
    <div className="flex flex-col md:flex-row justify-between">
      <div className="flex items-center md:items-start gap-2 md:gap-4">
        {/* Profile picture with editing capability */}
        <ProfileImageEditor
          username={username || 'unknown'}
          imageUrl={imageUrl}
          isOwnProfile={isOwnProfile}
          size={72}
        />

        <div className="space-y-1 flex-1">
          <div className="flex flex-col md:flex-row gap-1 md:items-center">
            {/* Username editing */}
            {isOwnProfile ? (
              <div className="w-fit">
                <ProfileEditableField
                  value={
                    hasProfile
                      ? isSame
                        ? abbreviateWalletAddress({
                            address: profileInfo.profile.username,
                          })
                        : profileInfo.profile.username
                      : walletAddress
                      ? abbreviateWalletAddress({ address: walletAddress })
                      : 'unknown'
                  }
                  prefix={hasProfile && !isSame ? '@' : undefined}
                  isEditing={editingUsername}
                  onEdit={() => setEditingUsername(true)}
                  onSave={handleUsernameSave}
                  onCancel={() => setEditingUsername(false)}
                  loading={updateLoading}
                  title="Edit username"
                  className="font-bold"
                />
              </div>
            ) : (
              <p className="font-bold">
                {hasProfile
                  ? isSame
                    ? abbreviateWalletAddress({
                        address: profileInfo.profile.username,
                      })
                    : `@${profileInfo.profile.username}`
                  : walletAddress
                  ? abbreviateWalletAddress({ address: walletAddress })
                  : 'unknown'}
              </p>
            )}

            {hasProfile && profileInfo.walletAddress && !isSame && (
              <p className="text-muted-foreground">
                {abbreviateWalletAddress({
                  address: profileInfo.walletAddress,
                })}
              </p>
            )}
            <p className="text-muted-foreground desktop">
              • {t('common.since')} {creationYear}
            </p>
            <p className="text-muted-foreground mobile">
              {t('common.since')} {creationYear}
            </p>
          </div>

          {hasProfile && isSpecialUser(mainProfile) && (
            <SolidScoreProfileHeader id={profileInfo.profile.id} />
          )}

          {/* Bio editing - Desktop */}
          {isOwnProfile ? (
            <div className="text-muted-foreground text-sm desktop">
              <ProfileEditableField
                value={bio || ''}
                placeholder={t('common.no_description')}
                isEditing={editingBio}
                onEdit={() => setEditingBio(true)}
                onSave={handleBioSave}
                onCancel={() => setEditingBio(false)}
                maxLength={300}
                multiline={true}
                loading={updateLoading}
                title="Edit bio"
              />
            </div>
          ) : (
            <p className="text-muted-foreground text-sm desktop">
              {bio || t('common.no_description')}
            </p>
          )}
        </div>
      </div>

      {hasProfile && isSpecialUser(mainProfile) && (
        <SolidScoreSmartCtaWrapper />
      )}

      <div className="space-y-2">
        {!!mainProfile?.username &&
          !!username &&
          mainProfile.username !== username && (
            <div className="flex gap-2 my-4 md:my-0">
              <FollowButton
                className="flex-1"
                followerUsername={mainProfile.username}
                followeeUsername={username}
              />
              <FollowBlinkButton
                username={username}
                displayVariant="icon"
                title="Share follow link - Let others follow with one Solana transaction!"
              />
            </div>
          )}

        {/* Show blink button even when user is not logged in to encourage sharing */}
        {(!mainProfile?.username || mainProfile.username === username) &&
          username && (
            <div className="my-4 md:my-0">
              <FollowBlinkButton
                username={username}
                className="w-full"
                showLabel={true}
              />
            </div>
          )}

        {/* Bio editing - Mobile */}
        {isOwnProfile ? (
          <div className="text-muted-foreground text-sm mobile mb-6">
            <ProfileEditableField
              value={bio || ''}
              placeholder={t('common.no_description')}
              isEditing={editingBio}
              onEdit={() => setEditingBio(true)}
              onSave={handleBioSave}
              onCancel={() => setEditingBio(false)}
              maxLength={300}
              multiline={true}
              loading={updateLoading}
              title="Edit bio"
            />
          </div>
        ) : (
          <p className="text-muted-foreground text-sm mobile mb-6">
            {bio || t('common.no_description')}
          </p>
        )}

        <p className="flex items-center space-x-2 text-xs text-muted-foreground">
          <button
            onClick={() => {
              setModalTab('followers')
              setModalOpen(true)
            }}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            {followers} {t('common.follow.followers')}
          </button>
          <span>|</span>
          <button
            onClick={() => {
              setModalTab('following')
              setModalOpen(true)
            }}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            {following} {t('common.follow.following')}
          </button>
        </p>
      </div>

      {/* Username change confirmation modal */}
      <UsernameChangeModal
        isOpen={showUsernameWarning}
        currentUsername={profileInfo?.profile.username || ''}
        newUsername={pendingUsername}
        error={usernameError}
        loading={updateLoading}
        onConfirm={confirmUsernameSave}
        onCancel={handleUsernameModalCancel}
      />

      {/* Followers/Following modal */}
      {hasProfile && (
        <ProfileFollowersModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          username={profileInfo.profile.username}
          defaultTab={modalTab}
          totalFollowers={followers}
          totalFollowing={following}
        />
      )}
    </div>
  )
}
