'use client'

import { useFollowUser } from '@/components-new-version/tapestry/hooks/use-follow-user'
import { useGetFollowers } from '@/components-new-version/tapestry/hooks/use-get-followers'
import { useGetFollowersState } from '@/components-new-version/tapestry/hooks/use-get-followers-state'
import { useGetFollowing } from '@/components-new-version/tapestry/hooks/use-get-following'
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '@/components-new-version/ui'
import { revalidateServerCache } from '@/components-new-version/utils/revalidate-server-cache'
import { UserCheck, UserPlus } from 'lucide-react'
import { useState } from 'react'
//import { useUnfollowUser } from '../../hooks/use-unfollow-user'

interface Props extends Omit<ButtonProps, 'children'> {
  followerUsername: string
  followeeUsername: string
  small?: boolean
  children?: (isFollowing: boolean) => React.ReactNode
}

export function FollowButton({
  followerUsername,
  followeeUsername,
  small,
  children,
  ...props
}: Props) {
  const { followUser, loading: followUserLoading } = useFollowUser()
  //  const { unfollowUser, loading: unfollowUserLoading } = useUnfollowUser()

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

  const loading = followUserLoading || refetchLoading // || unfollowUserLoading

  const refetch = async () => {
    setRefetchLoading(true)

    revalidateServerCache(`/api/profiles/${followerUsername}/following`)
    revalidateServerCache(`/api/profiles/${followeeUsername}/followers`)

    await Promise.all([refetchGetFollowing(), refetchGetFollowers()])

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

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        {...props}
        onClick={handleFollow}
        loading={loadingFollowersState}
        disabled={loading || isFollowing}
        variant={ButtonVariant.SECONDARY}
        size={small ? ButtonSize.SM : ButtonSize.DEFAULT}
      >
        {!!children ? (
          children(!!isFollowing)
        ) : (
          <>
            {isFollowing ? (
              small ? (
                <UserCheck size={20} />
              ) : (
                'Following'
              )
            ) : small ? (
              <UserPlus size={20} />
            ) : (
              'Follow'
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
