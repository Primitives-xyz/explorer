'use client'

import { FollowButton } from '@/components/common/follow-button'
import { SolidScoreProfileHeader } from '@/components/profile/components/profile-header/solid-score-profile-header'
import { SolidScoreSmartCta } from '@/components/solid-score/smart-cta/solid-score-smart-cta'
import { IGetProfileResponse } from '@/components/tapestry/models/profiles.models'
import { Avatar } from '@/components/ui/avatar/avatar'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isSpecialUser } from '@/utils/user-permissions'
import { abbreviateWalletAddress } from '@/utils/utils'
import { useTranslations } from 'next-intl'

interface Props {
  profileInfo?: IGetProfileResponse
  walletAddress?: string
}

export function ProfileHeader({ profileInfo, walletAddress }: Props) {
  const { mainProfile } = useCurrentWallet()
  const t = useTranslations()

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

  return (
    <div className="flex flex-col md:flex-row justify-between">
      <div className="flex items-center md:items-start gap-2 md:gap-4">
        <Avatar
          username={username || 'unknown'}
          imageUrl={imageUrl}
          className={hasProfile ? 'w-18 h-18 aspect-square' : 'w-10 md:w-18'}
          size={72}
        />
        <div className="space-y-1">
          <div className="flex flex-col md:flex-row gap-1 md:items-center">
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

          <p className="text-muted-foreground text-sm desktop">
            {bio || t('common.no_description')}
          </p>
        </div>
      </div>

      {hasProfile && isSpecialUser(mainProfile) && <SolidScoreSmartCta />}

      <div className="space-y-2">
        {!!mainProfile?.username &&
          !!username &&
          mainProfile.username !== username && (
            <FollowButton
              className="my-4 md:my-0 w-full"
              followerUsername={mainProfile.username}
              followeeUsername={username}
            />
          )}
        <p className="text-muted-foreground text-sm mobile mb-6">
          {bio || t('common.no_description')}
        </p>
        <p className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>
            {followers} {t('common.follow.followers')}
          </span>
          <span>|</span>
          <span>
            {following} {t('common.follow.following')}
          </span>
        </p>
      </div>
    </div>
  )
}
