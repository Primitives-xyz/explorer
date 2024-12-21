'use client'

import { Alert } from '@/components/common/alert'
import { LoadCircle } from '@/components/common/load-circle'
import { useFollowUser } from '@/components/profile/hooks/use-follow-user'
import { useGetFollowers } from '@/components/profile/hooks/use-get-followers'
import { UserRoundCheck } from 'lucide-react'
import { useState } from 'react'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'

interface Props {
  username: string
}

export function FollowButton({ username }: Props) {
  const { walletAddress, mainUsername, loadingMainUsername } =
    useCurrentWallet()
  const { followUser, unfollowUser, loading, error, success } = useFollowUser()
  const { followers, mutate } = useGetFollowers(username)
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false)

  const followersList = followers?.profiles?.map((item) => item.username)
  const isFollowing = followersList?.includes(mainUsername)

  const handleFollow = async () => {
    if (mainUsername && username) {
      await followUser({
        followerUsername: mainUsername,
        followeeUsername: username,
      })
      await mutate()
      await fetch(`/api/profiles/${username}`, { method: 'HEAD' })
    }
  }

  const handleUnfollow = async () => {
    if (mainUsername && username) {
      await unfollowUser({
        followerUsername: mainUsername,
        followeeUsername: username,
      })
      setShowUnfollowConfirm(false)
      await mutate()
      await fetch(`/api/profiles/${username}`, { method: 'HEAD' })
    }
  }

  if (!walletAddress) {
    console.log('FollowButton: No wallet connected')
    return null
  }

  if (mainUsername === username) {
    console.log('FollowButton: Viewing own profile')
    return null
  }

  if (loadingMainUsername) {
    console.log('FollowButton: Loading main username')
    return (
      <span>
        <LoadCircle />
      </span>
    )
  }

  if (isFollowing) {
    return (
      <>
        {showUnfollowConfirm ? (
          <div className="space-y-2">
            <button
              onClick={handleUnfollow}
              disabled={loading}
              className="w-full px-4 py-2 bg-red-900/30 text-red-400 font-mono border border-red-800 hover:bg-red-900/50 transition-colors rounded disabled:opacity-50"
            >
              {loading ? 'Unfollowing...' : 'Confirm Unfollow'}
            </button>
            <button
              onClick={() => setShowUnfollowConfirm(false)}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-900/30 text-green-400 font-mono border border-green-800 hover:bg-green-900/50 transition-colors rounded"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowUnfollowConfirm(true)}
            className="w-full px-4 py-2 bg-green-900/30 text-green-400 font-mono border border-green-800 hover:bg-green-900/50 transition-colors rounded flex items-center justify-center gap-2"
          >
            <UserRoundCheck size={16} />
            Following
          </button>
        )}
      </>
    )
  }

  return (
    <>
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`
          w-full px-4 py-2 
          font-mono text-sm
          border rounded
          transition-colors
          ${
            isFollowing
              ? 'bg-green-900/30 text-green-400 border-green-800 hover:bg-green-900/50'
              : 'bg-green-500/20 text-green-400 border-green-500 hover:bg-green-500/30'
          }
        `}
      >
        {loading ? 'Following...' : 'Follow'}
      </button>

      {success && (
        <Alert
          type="success"
          message={
            isFollowing ? 'Unfollowed successfully!' : 'Followed successfully!'
          }
          duration={5000}
        />
      )}

      {error && (
        <Alert
          type="error"
          message={`There was an error ${
            isFollowing ? 'unfollowing' : 'following'
          } the user.`}
          duration={5000}
        />
      )}
    </>
  )
}
