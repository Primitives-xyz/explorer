'use client'

import { FollowButton } from '@/components-new-version/common/follow-button'
import { IGetProfilesResponseEntry } from '@/components-new-version/models/profiles.models'
import { Avatar } from '@/components-new-version/ui/avatar/avatar'
import { abbreviateWalletAddress } from '@/components-new-version/utils/utils'

interface Props {
  profileInfo: IGetProfilesResponseEntry
  displayUsername: string
  mainUsername?: string
}

export function ProfileHeader({
  profileInfo,
  displayUsername,
  mainUsername,
}: Props) {
  const creationYear = profileInfo?.profile.created_at
    ? new Date(profileInfo.profile.created_at).getFullYear()
    : new Date().getFullYear()

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <Avatar username={displayUsername} size={72} className="w-18" />
        <div className="space-y-2">
          <div className="flex gap-1 items-center">
            <p className="font-bold">@{profileInfo.profile.username}</p>
            {profileInfo?.wallet?.address && (
              <p className="text-muted-foreground">
                {abbreviateWalletAddress({
                  address: profileInfo.wallet.address,
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
        {!!profileInfo?.profile.username && !!mainUsername && (
          <FollowButton
            expand
            followerUsername={mainUsername}
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
