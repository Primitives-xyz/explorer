'use client'

import { FollowButton } from '@/components/common/follow-button'
import { SolidScoreProfileHeader } from '@/components/profile/components/profile-header/solid-score-profile-header'
import { SolidScoreSmartCtaWrapper } from '@/components/solid-score/components/smart-cta/solid-score-smart-cta-wrapper'
import { IGetProfileResponse } from '@/components/tapestry/models/profiles.models'
import { Button, ButtonVariant } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { createURL } from '@/utils/api'
import { share } from '@/utils/share'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isSpecialUser } from '@/utils/user-permissions'
import { abbreviateWalletAddress, cn } from '@/utils/utils'
import { ShareIcon } from 'lucide-react'
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

  const isPudgy = false
  // const isPudgy = true

  return (
    <div className="flex flex-col md:flex-row justify-between">
      <div className="flex items-center md:items-start gap-2 md:gap-4">
        <Avatar
          username={username || 'unknown'}
          imageUrl={imageUrl}
          className={hasProfile ? 'w-18 h-18 aspect-square' : 'w-10 md:w-18'}
          size={72}
        />
        <div>
          <div className="flex flex-col md:flex-row gap-1 md:items-center">
            <p
              className={cn('mb-1', {
                'font-bold': !isPudgy,
                'font-pudgy-heading text-xl': isPudgy,
              })}
            >
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
            <span className="desktop">•</span>
            <p
              className={cn('text-sm', {
                'text-muted-foreground': !isPudgy,
                'font-pudgy-body uppercase': isPudgy,
              })}
            >
              {t('common.since')} {creationYear}
            </p>
          </div>

          <p
            className={cn('text-sm desktop', {
              'text-muted-foreground': !isPudgy,
              'font-pudgy-body uppercase': isPudgy,
            })}
          >
            {bio || t('common.no_description')}
          </p>

          {hasProfile && isSpecialUser(mainProfile) && (
            <SolidScoreProfileHeader profileId={profileInfo.profile.id} />
          )}
        </div>
      </div>

      {hasProfile && isSpecialUser(mainProfile) && (
        <div className="my-3 md:my-0">
          <SolidScoreSmartCtaWrapper />
        </div>
      )}

      <div className="space-y-2">
        {!!mainProfile?.username && (
          <Button
            className="w-full"
            // variant={ButtonVariant.DEFAULT_SOCIAL}
            variant={
              isPudgy
                ? ButtonVariant.PUDGY_SECONDARY
                : ButtonVariant.DEFAULT_SOCIAL
            }
            onClick={() =>
              share({
                title: 'Check out this profile on SSE!',
                url: createURL({
                  domain: window.location.origin,
                  endpoint: mainProfile.username,
                }),
              })
            }
          >
            {!isPudgy && <ShareIcon size={16} />} Share
          </Button>
        )}
        {!!mainProfile?.username &&
          !!username &&
          mainProfile.username !== username && (
            <FollowButton
              className="w-full"
              followerUsername={mainProfile.username}
              followeeUsername={username}
              isPudgy={isPudgy}
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
