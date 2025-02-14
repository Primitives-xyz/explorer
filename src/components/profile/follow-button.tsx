'use client'

import { Alert } from '@/components/common/alert'
import { useFollowUser } from '@/components/profile/hooks/use-follow-user'
import { useFollowStats } from '@/hooks/use-follow-stats'
import { useProfileFollowers } from '@/hooks/use-profile-followers'
import { LoaderCircle, UserRoundCheck, UserRoundPlus } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'

const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton
    ),
  { ssr: false }
)

interface Props {
  username: string
  size?: 'sm' | 'lg'
}

export function FollowButton({ username, size = 'sm' }: Props) {
  const { mainUsername, isLoggedIn, sdkHasLoaded } = useCurrentWallet()
  const { followUser, unfollowUser, loading, success } = useFollowUser()
  const { mutate: mutateFollowers } = useProfileFollowers(username)
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false)
  const {
    stats,
    mutate: mutateStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useFollowStats(username, mainUsername)
  const isFollowing = stats?.isFollowing ?? false
  const [optimisticFollowing, setOptimisticFollowing] = useState(false)

  const buttonClasses = `font-mono rounded transition-colors ${
    size === 'lg' ? 'px-4 py-2 text-sm' : 'px-2 py-1 text-xs'
  }`
  const iconSize = size === 'lg' ? 16 : 14

  // Reset optimistic state and revalidate on mount or username change
  useEffect(() => {
    setOptimisticFollowing(false)
    mutateStats()
    mutateFollowers()
  }, [username, mainUsername, mutateStats, mutateFollowers])

  // Sync optimistic state with actual state only when not in a loading state
  useEffect(() => {
    if (
      !loading &&
      stats?.isFollowing !== undefined &&
      stats?.isFollowing !== null
    ) {
      setOptimisticFollowing(stats.isFollowing)
    }
  }, [stats?.isFollowing, loading])

  // Handle stats error gracefully without page refresh
  if (!!statsError) {
    console.error('Stats error:', statsError)
    return (
      <div
        className={`${buttonClasses} bg-red-900/30 text-red-400 border border-red-800`}
      >
        Error
      </div>
    )
  }

  // Early return if viewing own profile
  if (mainUsername === username) return null

  // Show loading state while initializing
  if (isLoggedIn && isLoadingStats) {
    return (
      <div
        className={`${buttonClasses} flex items-center gap-1 bg-neutral-900/30 text-neutral-400 border border-neutral-800`}
      >
        <LoaderCircle className="animate-spin" size={iconSize} />
        <span>Loading...</span>
      </div>
    )
  }

  // If not logged in or SDK hasn't loaded, show follow button that triggers connect wallet
  if (!isLoggedIn || !sdkHasLoaded) {
    return (
      <DynamicConnectButton>
        <div
          className={`${buttonClasses} flex items-center gap-1 bg-green-900/30  border border-green-800 hover:bg-green-900/50 cursor-pointer`}
        >
          <UserRoundPlus size={iconSize} />
          Follow
        </div>
      </DynamicConnectButton>
    )
  }

  const handleFollow = () => {
    if (!mainUsername) return

    // Set optimistic state immediately
    setOptimisticFollowing(true)

    // Optimistically update the local data
    mutateStats(
      (currentData) =>
        currentData
          ? {
              ...currentData,
              isFollowing: true,
            }
          : currentData,
      false // Don't revalidate immediately
    )

    followUser({
      followerUsername: mainUsername,
      followeeUsername: username,
    })
      .then(async () => {
        try {
          // Revalidate both followers and stats
          await Promise.all([
            mutateFollowers(),
            mutateStats(),
            fetch(`/api/profiles/${username}`, { method: 'HEAD' }),
          ])
        } catch (error) {
          console.error('Failed to revalidate after follow:', error)
        }
      })
      .catch((error) => {
        console.error('Failed to follow:', error)
        setOptimisticFollowing(false)
        // Revert the optimistic update
        mutateStats()
      })
  }

  const handleUnfollow = async () => {
    if (!mainUsername) return

    try {
      // Set optimistic state immediately
      setOptimisticFollowing(false)

      // Optimistically update the local data
      mutateStats(
        (currentData) =>
          currentData
            ? {
                ...currentData,
                isFollowing: false,
              }
            : currentData,
        false // Don't revalidate immediately
      )

      await unfollowUser({
        followerUsername: mainUsername,
        followeeUsername: username,
      })
      try {
        // Revalidate both followers and stats
        await Promise.all([
          mutateFollowers(),
          mutateStats(),
          fetch(`/api/profiles/${username}`, { method: 'HEAD' }),
        ])
      } catch (error) {
        console.error('Failed to revalidate after unfollow:', error)
      }
      setShowUnfollowConfirm(false)
    } catch (error) {
      console.error('Failed to unfollow:', error)
      // Reset optimistic state and revert the optimistic update
      setOptimisticFollowing(true)
      mutateStats()
    }
  }

  if (isFollowing || optimisticFollowing) {
    return (
      <>
        {showUnfollowConfirm ? (
          <div className="flex gap-1">
            <button
              onClick={handleUnfollow}
              disabled={loading}
              className={`${buttonClasses} bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50 disabled:opacity-50`}
            >
              {loading ? 'Unfollowing...' : 'Unfollow?'}
            </button>
            <button
              onClick={() => setShowUnfollowConfirm(false)}
              disabled={loading}
              className={`${buttonClasses} bg-neutral-900/30 text-neutral-400 border border-neutral-800 hover:bg-neutral-900/50`}
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowUnfollowConfirm(true)}
            className={`${buttonClasses} bg-neutral-900/30 text-neutral-400 border border-neutral-800 hover:bg-neutral-900/50 flex items-center gap-1`}
          >
            <UserRoundCheck size={iconSize} />
            Following
          </button>
        )}
        {success && (
          <Alert
            type="success"
            message="Followed successfully!"
            duration={5000}
          />
        )}
      </>
    )
  }

  return (
    <>
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`${buttonClasses} flex items-center gap-1 bg-green-900/30  border border-green-800 hover:bg-green-900/50 disabled:opacity-50`}
      >
        <UserRoundPlus size={iconSize} />
        {loading ? 'Following...' : 'Follow'}
      </button>
    </>
  )
}
