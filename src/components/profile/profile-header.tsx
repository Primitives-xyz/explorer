import type { ProfileData } from '@/hooks/use-profile-data'
import { memo, useEffect } from 'react'
import { Avatar } from '../common/avatar'
import { TokenAddress } from '../tokens/token-address'
import { FollowButton } from './follow-button'
import { EXPLORER_NAMESPACE } from '@/lib/constants'

interface ProfileHeaderProps {
  username: string
  profileData?: ProfileData
  isLoading: boolean
  walletAddressError?: boolean
  onEditProfile: () => void
  isOwnProfile: boolean
  namespaceLink?: string | null
}

export const ProfileHeader = memo(function ProfileHeader({
  username,
  profileData,
  isLoading,
  walletAddressError,
  onEditProfile,
  isOwnProfile,
  namespaceLink,
}: ProfileHeaderProps) {
  useEffect(() => {
    console.log('[ProfileHeader] rerender:', {
      username,
      profileData,
      walletAddress: profileData?.walletAddress,
      isLoading,
      walletAddressError,
      isOwnProfile,
      namespaceLink
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
              <h1 className="text-4xl font-mono ">@{username}</h1>
              {profileData?.profile.bio && (
                <p className="text-sm  mt-1">{profileData.profile.bio}</p>
              )}
              {!isLoading && profileData?.walletAddress && (
                <div className="flex items-center gap-2 text-sm  mt-2">
                  owned by <TokenAddress address={profileData.walletAddress} />
                  {walletAddressError && (
                    <span className="text-red-500 font-mono text-xs">
                      (Invalid wallet address)
                    </span>
                  )}
                </div>
              )}
              {!isLoading && namespaceLink && namespaceLink !== '' && (
                <div className="flex items-center gap-2 text-sm  mt-2">
                  <a href={namespaceLink} target="_blank">
                    <button className="uppercase px-4 py-1.5 border border-green-500/50 hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors cursor-pointer flex-shrink-0">
                    See original
                    </button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOwnProfile && (
            <button
              onClick={onEditProfile}
              className="px-4 py-1.5 border border-green-500/50  hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors"
            >
              Edit Profile
            </button>
          )}
          {profileData?.namespace?.name === EXPLORER_NAMESPACE &&
          <>
            <FollowButton username={username} size="lg" />
          </>
          }
        </div>
      </div>
    </div>
  )
})
