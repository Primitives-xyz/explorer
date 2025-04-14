'use client'

import { useFollowUser } from '@/components/tapestry/hooks/use-follow-user'
import { useGetFollowers } from '@/components/tapestry/hooks/use-get-followers'
import { useGetFollowersState } from '@/components/tapestry/hooks/use-get-followers-state'
import { useGetFollowing } from '@/components/tapestry/hooks/use-get-following'
import { Button, ButtonProps, ButtonSize, ButtonVariant } from '@/components/ui'
import { UserCheck, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useCurrentWallet } from '../utils/use-current-wallet'
//import { useUnfollowUser } from '../../hooks/use-unfollow-user'

interface Props extends Omit<ButtonProps, 'children'> {
  followerUsername: string
  followeeUsername: string
  onFollowSuccess?: () => void
  children?: (isFollowing: boolean) => React.ReactNode
}

export function FollowButton({
  followerUsername,
  followeeUsername,
  onFollowSuccess,
  children,
  ...props
}: Props) {
  const { followUser, loading: followUserLoading } = useFollowUser()
  //  const { unfollowUser, loading: unfollowUserLoading } = useUnfollowUser()
  const { refetch: refetchCurrentUser, loading: loadingCurrentUser } =
    useCurrentWallet()
  const { refetch: refetchGetFollowing } = useGetFollowing({
    username: followerUsername,
  })
  const { refetch: refetchGetFollowers } = useGetFollowers({
    username: followeeUsername,
  })
  const [refetchLoading, setRefetchLoading] = useState(false)
  const {
    data,
    loading: loadingFollowersState,
    refetch: refetchFollowersState,
  } = useGetFollowersState({
    followeeUsername,
    followerUsername,
  })
  const [isFollowingOptimistic, setIsFollowingOptimistic] = useState(
    data?.isFollowing
  )

  const loading = followUserLoading || refetchLoading || loadingCurrentUser // || unfollowUserLoading

  const refetch = async () => {
    setRefetchLoading(true)

    // revalidateServerCache(`/api/profiles/${followerUsername}/following`)
    // revalidateServerCache(`/api/profiles/${followeeUsername}/followers`)

    await Promise.all([
      refetchCurrentUser(),
      refetchGetFollowing(),
      refetchGetFollowers(),
    ])

    setRefetchLoading(false)
  }

  const handleFollow = async () => {
    setIsFollowingOptimistic(true)

    try {
      await followUser({
        followerUser: { username: followerUsername },
        followeeUser: { username: followeeUsername },
      })
      await refetch()
      onFollowSuccess?.()
    } catch (error) {
      console.error('Failed to follow:', error)
      setIsFollowingOptimistic(false)
    } finally {
      refetchFollowersState()
    }
  }

  //   const handleUnfollow = async () => {
  //     setIsFollowingOptimistic(false)

  //     try {
  //       await unfollowUser({
  //         followerUsername,
  //         followeeUsername,
  //       })
  //       await refetch()
  //     } catch (error) {
  //       console.error('Failed to unfollow:', error)
  //       setIsFollowingOptimistic(true)
  //     } finally {
  //       refetchFollowersState()
  //     }
  //   }

  if (followerUsername === followeeUsername) {
    return null
  }

  const isFollowing = isFollowingOptimistic ?? data?.isFollowing
  const isIcon =
    props.size === ButtonSize.ICON || props.size === ButtonSize.ICON_SM
  const iconSize =
    props.size === ButtonSize.ICON || props.size === ButtonSize.DEFAULT
      ? 18
      : 14

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        {...props}
        onClick={handleFollow}
        loading={loadingFollowersState}
        disabled={loading || isFollowing}
        variant={ButtonVariant.SECONDARY_SOCIAL}
      >
        {!!children ? (
          children(!!isFollowing)
        ) : (
          <>
            {isFollowing ? (
              isIcon ? (
                <UserCheck size={iconSize} />
              ) : (
                <>
                  <UserCheck size={iconSize} /> Following
                </>
              )
            ) : isIcon ? (
              <UserPlus size={iconSize} />
            ) : (
              <>
                <UserPlus size={iconSize} /> Follow
              </>
            )}
          </>
        )}
      </Button>
      {/* {isFollowing && (
        <Button
          variant={ButtonVariant.LINK}
          onClick={handleUnfollow}
          className="text-xs"
          disabled={loading}
        >
          Unfollow
        </Button>
      )} */}
    </div>
  )
}
