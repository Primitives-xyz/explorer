'use client'

import { useFollowUser } from '@/components/tapestry/hooks/use-follow-user'
import { useFollowWallet } from '@/components/tapestry/hooks/use-follow-wallet'
import { useGetFollowers } from '@/components/tapestry/hooks/use-get-followers'
import { useGetFollowersState } from '@/components/tapestry/hooks/use-get-followers-state'
import { useGetFollowing } from '@/components/tapestry/hooks/use-get-following'
import { useUnfollowUser } from '@/components/tapestry/hooks/use-unfollow-user'
import { useUnfollowWallet } from '@/components/tapestry/hooks/use-unfollow-wallet'
import { Button, ButtonProps, ButtonSize, ButtonVariant } from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isValidSolanaAddress } from '@/utils/validation'
import { UserMinus, UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props extends Omit<ButtonProps, 'children'> {
  followerUsername: string
  followeeUsername: string
  isPudgy?: boolean
  onFollowSuccess?: () => void
  children?: (isFollowing: boolean) => React.ReactNode
}

export function FollowButton({
  followerUsername,
  followeeUsername,
  isPudgy = false,
  onFollowSuccess,
  children,
  ...props
}: Props) {
  const { followUser, loading: followUserLoading } = useFollowUser()
  const { unfollowUser, loading: unfollowUserLoading } = useUnfollowUser()
  const { followWallet, loading: followWalletLoading } = useFollowWallet()
  const { unfollowWallet, loading: unfollowWalletLoading } = useUnfollowWallet()
  const {
    refetch: refetchCurrentUser,
    loading: loadingCurrentUser,
    walletAddress,
  } = useCurrentWallet()
  const { refetch: refetchGetFollowing } = useGetFollowing({
    username: followerUsername,
  })
  const { refetch: refetchGetFollowers } = useGetFollowers({
    username: followeeUsername,
  })
  const [refetchLoading, setRefetchLoading] = useState(false)
  const t = useTranslations()

  // Determine if followeeUsername is a wallet address
  const isWalletAddress = isValidSolanaAddress(followeeUsername)

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

  const loading =
    followUserLoading ||
    followWalletLoading ||
    refetchLoading ||
    loadingCurrentUser ||
    unfollowUserLoading ||
    unfollowWalletLoading

  const refetch = async () => {
    setRefetchLoading(true)

    await Promise.all([
      refetchCurrentUser(),
      refetchGetFollowing(),
      refetchGetFollowers(),
    ])

    setRefetchLoading(false)
  }

  const handleFollow = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet to follow users')
      return
    }

    setIsFollowingOptimistic(true)

    try {
      if (isWalletAddress) {
        await followWallet({
          followerUsername,
          walletToFollow: followeeUsername,
          followerWallet: walletAddress,
        })
      } else {
        await followUser({
          followerUsername,
          followeeUsername,
        })
      }
      await refetch()
      onFollowSuccess?.()
    } catch (error) {
      console.error('Failed to follow:', error)
      setIsFollowingOptimistic(false)
      toast.error('Failed to follow user. Please try again.')
    } finally {
      refetchFollowersState()
    }
  }

  const handleUnfollow = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet to unfollow users')
      return
    }

    setIsFollowingOptimistic(false)

    try {
      if (isWalletAddress) {
        await followWallet({
          followerUsername,
          walletToFollow: followeeUsername,
          followerWallet: walletAddress,
          type: 'unfollow',
        })
      } else {
        await unfollowUser({
          followerUsername,
          followeeUsername,
        })
      }
      await refetch()
    } catch (error) {
      console.error('Failed to unfollow:', error)
      setIsFollowingOptimistic(true)
      toast.error('Failed to unfollow user. Please try again.')
    } finally {
      refetchFollowersState()
    }
  }

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
        onClick={isFollowing ? handleUnfollow : handleFollow}
        loading={loadingFollowersState}
        disabled={loading}
        variant={
          isPudgy ? ButtonVariant.PUDGY_DEFAULT : ButtonVariant.SECONDARY_SOCIAL
        }
      >
        {!!children ? (
          children(!!isFollowing)
        ) : (
          <>
            {isFollowing ? (
              isIcon ? (
                <UserMinus size={iconSize} />
              ) : (
                <>
                  {!isPudgy && <UserMinus size={iconSize} />}{' '}
                  {t('common.follow.unfollow')}
                </>
              )
            ) : isIcon ? (
              <UserPlus size={iconSize} />
            ) : (
              <>
                {!isPudgy && <UserPlus size={iconSize} />}{' '}
                {t('common.follow.follow')}
              </>
            )}
          </>
        )}
      </Button>
    </div>
  )
}
