'use client'

import { Alert } from '@/components/common/alert'
import { LoadCircle } from '@/components/common/load-circle'
import { useFollowUser } from '@/components/profile/hooks/use-follow-user'
import { UserRoundCheck, UserRoundPlus } from 'lucide-react'
import { useState } from 'react'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { useProfileFollowers } from '@/hooks/use-profile-followers'
import { useFollowStats } from '@/hooks/use-follow-stats'

interface Props {
  username: string
  size?: 'sm' | 'lg'
}

export function FollowButton({ username, size = 'sm' }: Props) {
  const { walletAddress, mainUsername, loadingMainUsername } =
    useCurrentWallet()
  const { followUser, unfollowUser, loading, error, success } = useFollowUser()
  const { followers, mutate } = useProfileFollowers(username)
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false)
  const [optimisticIsFollowing, setOptimisticIsFollowing] = useState<
    boolean | null
  >(null)
  const { stats } = useFollowStats(username, mainUsername)
  const isFollowing = stats?.isFollowing || false

  const handleFollow = async () => {
    if (mainUsername && username) {
      setOptimisticIsFollowing(true)
      try {
        await followUser({
          followerUsername: mainUsername,
          followeeUsername: username,
        })
        await mutate()
      } catch (error) {
        setOptimisticIsFollowing(false)
      }
      await fetch(`/api/profiles/${username}`, { method: 'HEAD' })
    }
  }

  const handleUnfollow = async () => {
    if (mainUsername && username) {
      setOptimisticIsFollowing(false)
      try {
        await unfollowUser({
          followerUsername: mainUsername,
          followeeUsername: username,
        })
        await mutate()
      } catch (error) {
        setOptimisticIsFollowing(true)
      }
      setShowUnfollowConfirm(false)
      await fetch(`/api/profiles/${username}`, { method: 'HEAD' })
    }
  }

  if (!walletAddress || mainUsername === username || loadingMainUsername) {
    return null
  }

  const buttonClasses =
    size === 'lg' ? 'px-4 py-2 text-sm' : 'px-2 py-1 text-xs'

  const iconSize = size === 'lg' ? 16 : 14

  if (isFollowing) {
    return (
      <>
        {showUnfollowConfirm ? (
          <div className="flex gap-1">
            <button
              onClick={handleUnfollow}
              disabled={loading}
              className={`${buttonClasses} bg-red-900/30 text-red-400 font-mono border border-red-800 hover:bg-red-900/50 transition-colors rounded disabled:opacity-50`}
            >
              {loading ? 'Unfollowing...' : 'Unfollow?'}
            </button>
            <button
              onClick={() => setShowUnfollowConfirm(false)}
              disabled={loading}
              className={`${buttonClasses} bg-green-900/30 text-green-400 font-mono border border-green-800 hover:bg-green-900/50 transition-colors rounded`}
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowUnfollowConfirm(true)}
            className={`${buttonClasses} bg-green-900/30 text-green-400 font-mono border border-green-800 hover:bg-green-900/50 transition-colors rounded flex items-center gap-1`}
          >
            <UserRoundCheck size={iconSize} />
            Following
          </button>
        )}
        {success && (
          <Alert
            type="success"
            message="Unfollowed successfully!"
            duration={5000}
          />
        )}
      </>
    )
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
        isFollowing
          ? 'bg-green-500/10 text-green-500 hover:bg-red-500/10 hover:text-red-400'
          : 'bg-green-500 text-black hover:bg-green-400'
      }`}
    >
      {loading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  )
}
