'use client'

import { FollowButton } from '@/components/common/follow-button'
import { IGetProfileResponse } from '@/components/tapestry/models/profiles.models'
import { Avatar } from '@/components/ui/avatar/avatar'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { abbreviateWalletAddress } from '@/utils/utils'

interface Props {
  profileInfo?: IGetProfileResponse
  walletAddress?: string
}

export function ProfileHeader({ profileInfo, walletAddress }: Props) {
  const { mainProfile } = useCurrentWallet()
  if (!profileInfo) {
    // Only wallet address is available
    return (
      <div className="flex items-center gap-2">
        <Avatar
          username={walletAddress || 'unknown'}
          className="w-10 md:w-18"
          size={72}
        />
        <div className="space-y-2">
          <div className="flex gap-1 items-center">
            {walletAddress && (
              <p className="text-muted-foreground">
                {abbreviateWalletAddress({ address: walletAddress })}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }
  const creationYear = profileInfo?.profile.created_at
    ? new Date(profileInfo.profile.created_at).getFullYear()
    : new Date().getFullYear()

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      <div className="flex items-center md:items-start gap-2">
        <Avatar
          username={profileInfo.profile.username}
          imageUrl={profileInfo.profile.image}
          className="w-18 h-18 aspect-square"
          size={72}
        />
        <div className="space-y-2">
          <div className="flex flex-col md:flex-row gap-1 md:items-center">
            <p className="font-bold">@{profileInfo.profile.username}</p>
            {profileInfo.walletAddress && (
              <p className="text-muted-foreground">
                {abbreviateWalletAddress({
                  address: profileInfo.walletAddress,
                })}
              </p>
            )}
            <p className="text-muted-foreground desktop">
              • since {creationYear}
            </p>
            <p className="text-muted-foreground mobile">since {creationYear}</p>
          </div>
          <p className="text-muted-foreground text-sm desktop">
            {profileInfo.profile.bio || 'No description'}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {!!profileInfo?.profile.username && !!mainProfile?.username && (
          <FollowButton
            className="my-4 md:my-0 w-full"
            followerUsername={mainProfile.username}
            followeeUsername={profileInfo?.profile.username}
          />
        )}
        <p className="text-muted-foreground text-sm mobile mb-6">
          {profileInfo.profile.bio || 'No description'}
        </p>
        <p className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>{profileInfo?.socialCounts?.followers} Followers</span>
          <span>|</span>
          <span>{profileInfo?.socialCounts?.following} Following</span>
        </p>
      </div>
    </div>
  )
}
