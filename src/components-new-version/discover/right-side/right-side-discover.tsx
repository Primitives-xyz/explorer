'use client'

import { FollowButton } from '@/components-new-version/common/follow-button'
import { useGetRecentProfiles } from '@/components-new-version/tapestry/hooks/use-get-recent-profiles'
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
} from '@/components-new-version/ui'
import { Avatar } from '@/components-new-version/ui/avatar/avatar'
import { route } from '@/components-new-version/utils/route'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import {
  abbreviateWalletAddress,
  cn,
} from '@/components-new-version/utils/utils'

export function RightSideDiscover() {
  const { profiles, loading } = useGetRecentProfiles()
  const { mainProfile } = useCurrentWallet()

  return (
    <div className="space-y-4 flex flex-col">
      <Card>
        <CardHeader className="bg-card-accent p-4">
          <CardTitle>Recent profiles</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[calc(100vh-220px)] overflow-auto p-0">
          <>
            {loading && (
              <span className="flex justify-center items-center h-48">
                <Spinner />
              </span>
            )}

            {profiles?.profiles.map((elem) => {
              const isSame = elem.wallet.address === elem.profile.username

              return (
                <span
                  key={elem.profile.username}
                  className={cn(
                    'flex items-center justify-between p-4',
                    profiles?.profiles.indexOf(elem) !==
                      profiles?.profiles.length - 1 &&
                      'border-b border-card-border'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Avatar size={32} username={elem.profile.username} />
                    <div className="flex flex-col">
                      {!isSame && (
                        <Button
                          variant={ButtonVariant.GHOST}
                          href={route('entity', { id: elem.profile.username })}
                          className="p-0 w-fit hover:bg-transparent"
                        >
                          @{elem.profile.username}
                        </Button>
                      )}
                      <Button
                        href={route('entity', { id: elem.wallet.address })}
                        variant={ButtonVariant.BADGE}
                        size={ButtonSize.SM}
                      >
                        {abbreviateWalletAddress({
                          address: elem.wallet.address,
                        })}
                      </Button>
                    </div>
                  </div>
                  {!!mainProfile?.username && (
                    <FollowButton
                      size={ButtonSize.SM}
                      followerUsername={mainProfile.username}
                      followeeUsername={elem.profile.username}
                    />
                  )}
                </span>
              )
            })}
          </>
        </CardContent>
      </Card>
    </div>
  )
}
