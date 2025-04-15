'use client'

import { FollowButton } from '@/components/common/follow-button'
import { useGetRecentProfiles } from '@/components/tapestry/hooks/use-get-recent-profiles'
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
} from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { abbreviateWalletAddress, cn } from '@/utils/utils'

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

            {profiles?.profiles.map((entry) => {
              const isSame = entry?.wallet?.address === entry.profile.username

              return (
                <div
                  key={entry.profile.username}
                  className={cn(
                    'flex items-center justify-between p-4',
                    profiles?.profiles.indexOf(entry) !==
                      profiles?.profiles.length - 1 &&
                      'border-b border-card-border'
                  )}
                >
                  <div className="flex items-center gap-4 w-2/3">
                    <Avatar size={32} username={entry.profile.username} />
                    <div className="flex flex-col items-start w-2/3">
                      <Button
                        variant={ButtonVariant.LINK}
                        href={route('entity', { id: entry.profile.username })}
                        className="px-0 !py-2 w-full flex items-start justify-start"
                      >
                        <p className="truncate text-foreground">
                          {isSame
                            ? `@${abbreviateWalletAddress({
                                address: entry.profile.username,
                              })}`
                            : `@${entry.profile.username}`}
                        </p>
                      </Button>

                      {!isSame && entry?.wallet?.address && (
                        <Button
                          href={route('entity', { id: entry.wallet.address })}
                          variant={ButtonVariant.BADGE}
                          size={ButtonSize.SM}
                        >
                          {abbreviateWalletAddress({
                            address: entry.wallet.address,
                          })}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    {!!mainProfile?.username && (
                      <FollowButton
                        size={ButtonSize.ICON}
                        followerUsername={mainProfile.username}
                        followeeUsername={entry.profile.username}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </>
        </CardContent>
      </Card>
    </div>
  )
}
