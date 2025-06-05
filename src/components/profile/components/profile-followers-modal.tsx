'use client'

import { FollowButton } from '@/components/common/follow-button'
import { IProfile } from '@/components/tapestry/models/profiles.models'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { usePaginatedQuery } from '@/utils/api/use-paginated-query'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { abbreviateWalletAddress } from '@/utils/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

interface ProfileFollowersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  username: string
  defaultTab?: 'followers' | 'following'
  totalFollowers?: number
  totalFollowing?: number
}

function ProfileListItem({ profile }: { profile: IProfile }) {
  const { mainProfile } = useCurrentWallet()
  const isOwnProfile = mainProfile?.username === profile.username

  return (
    <div className="flex items-center justify-between gap-3 py-3 min-w-0">
      <Link
        href={`/${profile.username}`}
        className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity min-w-0"
        onClick={(e) => {
          // Close modal when clicking on a profile
          const dialog = e.currentTarget.closest('[role="dialog"]')
          if (dialog) {
            const closeButton = dialog.querySelector(
              '[aria-label="Close"]'
            ) as HTMLButtonElement
            closeButton?.click()
          }
        }}
      >
        <Avatar
          username={profile.username}
          imageUrl={profile.image}
          size={40}
          className="w-10 h-10 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">
            @
            {profile.username.length > 20
              ? abbreviateWalletAddress({
                  address: profile.username,
                  desiredLength: 14,
                })
              : profile.username}
          </p>
          {profile.bio && (
            <p className="text-xs text-muted-foreground truncate">
              {profile.bio}
            </p>
          )}
        </div>
      </Link>
      {!isOwnProfile && mainProfile?.username && (
        <FollowButton
          followerUsername={mainProfile.username}
          followeeUsername={profile.username}
          size="sm"
          className="shrink-0 min-w-fit"
        />
      )}
    </div>
  )
}

export function ProfileFollowersModal({
  open,
  onOpenChange,
  username,
  defaultTab = 'followers',
  totalFollowers = 0,
  totalFollowing = 0,
}: ProfileFollowersModalProps) {
  const t = useTranslations()

  // Use paginated queries for followers and following
  const {
    data: followerProfiles,
    loading: loadingFollowers,
    onLoadMore: loadMoreFollowers,
  } = usePaginatedQuery<{ profiles: IProfile[] }>({
    endpoint: `profiles/${username}/followers`,
    pageSize: 10,
  })

  const {
    data: followingProfiles,
    loading: loadingFollowing,
    onLoadMore: loadMoreFollowing,
  } = usePaginatedQuery<{ profiles: IProfile[] }>({
    endpoint: `profiles/${username}/following`,
    pageSize: 10,
  })

  // Flatten the profiles from paginated responses
  const allFollowers = followerProfiles?.flatMap((page) => page.profiles) || []
  const allFollowing = followingProfiles?.flatMap((page) => page.profiles) || []

  // Truncate username if it's too long (likely a wallet address)
  const displayUsername =
    username.length > 20
      ? abbreviateWalletAddress({ address: username, desiredLength: 14 })
      : username

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[90vw] max-h-[85vh] flex flex-col">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="truncate">@{displayUsername}</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue={defaultTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2 mx-6 mt-4 shrink-0">
            <TabsTrigger value="followers" className="text-xs sm:text-sm">
              {totalFollowers} {t('common.follow.followers')}
            </TabsTrigger>
            <TabsTrigger value="following" className="text-xs sm:text-sm">
              {totalFollowing} {t('common.follow.following')}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="followers"
            className="flex-1 overflow-hidden flex flex-col mt-4 mb-4"
          >
            <div className="px-6 flex-1 overflow-y-auto">
              {loadingFollowers && allFollowers.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : allFollowers.length ? (
                <>
                  <div className="divide-y divide-border">
                    {allFollowers.map((profile) => (
                      <ProfileListItem key={profile.id} profile={profile} />
                    ))}
                  </div>
                  {allFollowers.length < totalFollowers && (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <p className="text-xs text-muted-foreground">
                        Showing {allFollowers.length} of {totalFollowers}{' '}
                        followers
                      </p>
                      <Button
                        onClick={loadMoreFollowers}
                        disabled={loadingFollowers}
                        variant="outline"
                        size="sm"
                      >
                        {loadingFollowers ? <Spinner /> : 'Load More'}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No followers yet
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="following"
            className="flex-1 overflow-hidden flex flex-col mt-4 mb-4"
          >
            <div className="px-6 flex-1 overflow-y-auto">
              {loadingFollowing && allFollowing.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : allFollowing.length ? (
                <>
                  <div className="divide-y divide-border">
                    {allFollowing.map((profile) => (
                      <ProfileListItem key={profile.id} profile={profile} />
                    ))}
                  </div>
                  {allFollowing.length < totalFollowing && (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <p className="text-xs text-muted-foreground">
                        Showing {allFollowing.length} of {totalFollowing}{' '}
                        following
                      </p>
                      <Button
                        onClick={loadMoreFollowing}
                        disabled={loadingFollowing}
                        variant="outline"
                        size="sm"
                      >
                        {loadingFollowing ? <Spinner /> : 'Load More'}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Not following anyone yet
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
