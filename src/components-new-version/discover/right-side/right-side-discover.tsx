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
                  <div className="flex items-center gap-4 w-full">
                    <Avatar size={32} username={elem.profile.username} />
                    <div className="flex flex-col items-start w-2/3">
                      <Button
                        variant={ButtonVariant.LINK}
                        href={route('entity', { id: elem.profile.username })}
                        className="px-0 !py-2 w-full flex items-start justify-start"
                      >
                        <p className="truncate text-foreground">
                          {isSame
                            ? `@${abbreviateWalletAddress({
                                address: elem.profile.username,
                              })}`
                            : `@${elem.profile.username}`}
                        </p>
                      </Button>

                      {!isSame && (
                        <Button
                          href={route('entity', { id: elem.wallet.address })}
                          variant={ButtonVariant.BADGE}
                          size={ButtonSize.SM}
                        >
                          {abbreviateWalletAddress({
                            address: elem.wallet.address,
                          })}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="w-[50px]">
                    {!!mainProfile?.username && (
                      <FollowButton
                        size={ButtonSize.ICON}
                        followerUsername={mainProfile.username}
                        followeeUsername={elem.profile.username}
                      />
                    )}
                  </div>
                </span>
              )
            })}
          </>
        </CardContent>
      </Card>
    </div>
  )
}
