import { memo, useEffect } from 'react'
import { TokenAddress } from '../tokens/TokenAddress'
import { Avatar } from '../common/Avatar'
import { FollowButton } from './follow-button'
import type { ProfileData } from '@/hooks/use-profile-data'

interface ProfileHeaderProps {
  username: string
  profileData?: ProfileData
  isLoading: boolean
  walletAddressError?: boolean
  onEditProfile: () => void
  isOwnProfile: boolean
}

export const ProfileHeader = memo(function ProfileHeader({
  username,
  profileData,
  isLoading,
  walletAddressError,
  onEditProfile,
  isOwnProfile,
}: ProfileHeaderProps) {
  useEffect(() => {
    console.log('[ProfileHeader] rerender:', {
      username,
      walletAddress: profileData?.walletAddress,
      isLoading,
      walletAddressError,
      isOwnProfile,
    })
  })

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              username={username}
              size={48}
              imageUrl={profileData?.profile.image}
            />
            <div>
              <h1 className="text-4xl font-mono text-green-400">@{username}</h1>
              {profileData?.profile.bio && (
                <p className="text-sm text-green-600 mt-1">{profileData.profile.bio}</p>
              )}
            </div>
          </div>
          {!isLoading && profileData?.walletAddress && (
            <div className="flex items-center gap-2 text-sm text-green-600 sm:mb-1">
              owned by <TokenAddress address={profileData.walletAddress} />
              {walletAddressError && (
                <span className="text-red-500 font-mono text-xs">
                  (Invalid wallet address)
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isOwnProfile && (
            <button
              onClick={onEditProfile}
              className="px-4 py-1.5 border border-green-500/50 text-green-400 hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors"
            >
              Edit Profile
            </button>
          )}
          <FollowButton username={username} size="lg" />
        </div>
      </div>
    </div>
  )
})
