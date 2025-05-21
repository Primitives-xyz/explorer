'use client'

import { FollowButton } from '@/components/common/follow-button'
import { SolidScoreProfileHeader } from '@/components/profile/components/profile-header/solid-score-profile-header'
import { SolidScoreSmartCta } from '@/components/solid-score/solid-score-smart-cta'
import { IGetProfileResponse } from '@/components/tapestry/models/profiles.models'
import { Avatar } from '@/components/ui/avatar/avatar'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { abbreviateWalletAddress } from '@/utils/utils'
import { useTranslations } from 'next-intl'

interface Props {
  profileInfo?: IGetProfileResponse
  walletAddress?: string
}

export function ProfileHeader({ profileInfo, walletAddress }: Props) {
  const { mainProfile, isLoggedIn } = useCurrentWallet()
  const t = useTranslations('profile.header')
  const commonT = useTranslations('common')

  if (!profileInfo) {
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

  const isSame = profileInfo?.profile.username === profileInfo.walletAddress

  return (
    <div className="flex flex-col md:flex-row justify-between">
      <div className="flex items-center md:items-start gap-2 md:gap-4">
        <Avatar
          username={profileInfo.profile.username}
          imageUrl={profileInfo.profile.image}
          className="w-18 h-18 aspect-square"
          size={72}
        />
        <div className="space-y-1">
          <div className="flex flex-col md:flex-row gap-1 md:items-center">
            <p className="font-bold">
              {isSame
                ? abbreviateWalletAddress({
                    address: profileInfo.profile.username,
                  })
                : `@${profileInfo.profile.username}`}
            </p>
            {profileInfo.walletAddress && !isSame && (
              <p className="text-muted-foreground">
                {abbreviateWalletAddress({
                  address: profileInfo.walletAddress,
                })}
              </p>
            )}
            <p className="text-muted-foreground desktop">
              • {t('since')} {creationYear}
            </p>
            <p className="text-muted-foreground mobile">
              {t('since')} {creationYear}
            </p>
          </div>

          {profileInfo.profile.username &&
            (profileInfo.profile.username === 'nehemiah' ||
              profileInfo.profile.username === 'nemoblackburn' ||
              profileInfo.profile.username === 'cedrick') && (
              <SolidScoreProfileHeader id={profileInfo.profile.id} />
            )}

          <p className="text-muted-foreground text-sm desktop">
            {profileInfo.profile.bio || t('no_description')}
          </p>
        </div>
      </div>

      {isLoggedIn &&
        mainProfile?.username &&
        (mainProfile?.username === 'nehemiah' ||
          mainProfile?.username === 'nemoblackburn' ||
          mainProfile?.username === 'cedrick') && <SolidScoreSmartCta />}

      <div className="space-y-2">
        {!!profileInfo?.profile.username && !!mainProfile?.username && (
          <FollowButton
            className="my-4 md:my-0 w-full"
            followerUsername={mainProfile.username}
            followeeUsername={profileInfo?.profile.username}
          />
        )}
        <p className="text-muted-foreground text-sm mobile mb-6">
          {profileInfo.profile.bio || t('no_description')}
        </p>
        <p className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>
            {profileInfo?.socialCounts?.followers} {t('followers')}
          </span>
          <span>|</span>
          <span>
            {profileInfo?.socialCounts?.following} {t('following')}
          </span>
        </p>
      </div>
    </div>
  )
}
