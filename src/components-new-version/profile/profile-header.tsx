'use client'

import { FollowButton } from '@/components-new-version/common/follow-button'
import { IGetProfilesResponseEntry } from '@/components-new-version/models/profiles.models'
import { Avatar } from '@/components-new-version/ui/avatar/avatar'
import { abbreviateWalletAddress } from '@/components-new-version/utils/utils'

interface Props {
  profileInfo: IGetProfilesResponseEntry | null
  mainUsername?: string
  username?: string
}

export function ProfileHeader({ profileInfo, mainUsername, username }: Props) {
  const creationYear = profileInfo?.profile.created_at
    ? new Date(profileInfo?.profile.created_at).getFullYear()
    : new Date().getFullYear()

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-start space-x-3">
        {username && <Avatar username={username} size={72} />}
        <div className="flex space-x-1 items-center">
          <p className="font-bold">@{profileInfo?.profile.username}</p>
          {profileInfo?.wallet?.address && (
            <p className="text-muted-foreground">
              {abbreviateWalletAddress({
                address: profileInfo.wallet.address,
              })}
            </p>
          )}
          <p className="text-muted-foreground">• since {creationYear}</p>
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
