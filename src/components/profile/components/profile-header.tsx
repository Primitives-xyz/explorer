'use client'

import { FollowButton } from '@/components/common/follow-button'
import { IGetProfileResponse } from '@/components/models/profiles.models'
import { Avatar } from '@/components/ui/avatar/avatar'
import { useCurrentWallet } from '@/components/utils/use-current-wallet'
import { abbreviateWalletAddress } from '@/components/utils/utils'

interface Props {
  profileInfo: IGetProfileResponse
}

export function ProfileHeader({ profileInfo }: Props) {
  const { mainProfile } = useCurrentWallet()
  const creationYear = profileInfo?.profile.created_at
    ? new Date(profileInfo.profile.created_at).getFullYear()
    : new Date().getFullYear()

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <Avatar
          username={profileInfo.profile.username}
          imageUrl={profileInfo.profile.image}
          className="w-18"
          size={72}
        />
        <div className="space-y-2">
          <div className="flex gap-1 items-center">
            <p className="font-bold">@{profileInfo.profile.username}</p>
            {profileInfo.walletAddress && (
              <p className="text-muted-foreground">
                {abbreviateWalletAddress({
                  address: profileInfo.walletAddress,
                })}
              </p>
            )}
            <p className="text-muted-foreground">• since {creationYear}</p>
          </div>
          <p className="text-muted-foreground text-sm">
            {profileInfo.profile.bio || 'No description'}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {!!profileInfo?.profile.username && !!mainProfile?.username && (
          <FollowButton
            expand
            followerUsername={mainProfile.username}
            followeeUsername={profileInfo?.profile.username}
          />
        )}
        <p className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>{profileInfo?.socialCounts?.followers} Followers</span>
          <span>|</span>
          <span>{profileInfo?.socialCounts?.following} Following</span>
        </p>
      </div>
    </div>
  )
}
