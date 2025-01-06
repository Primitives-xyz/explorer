'use client'

import { Alert } from '@/components/common/alert'
import { LoadCircle } from '@/components/common/load-circle'
import { useFollowUser } from '@/components/profile/hooks/use-follow-user'
import { UserRoundCheck, UserRoundPlus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { useProfileFollowers } from '@/hooks/use-profile-followers'
import { useFollowStats } from '@/hooks/use-follow-stats'
import { useHolderCheck } from '@/components/auth/hooks/use-holder-check'
import { FrogHolderRequired } from '../auth/FrogHolderRequired'

interface Props {
  username: string
  size?: 'sm' | 'lg'
}

export function FollowButton({ username, size = 'sm' }: Props) {
  const { walletAddress, mainUsername } = useCurrentWallet()
  const { followUser, unfollowUser, loading, success } = useFollowUser()
  const { mutate } = useProfileFollowers(username)
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false)
  const { stats } = useFollowStats(username, mainUsername)
  const isFollowing = stats?.isFollowing || false
  const [optimisticFollowing, setOptimisticFollowing] = useState(false)
  const [showHolderModal, setShowHolderModal] = useState(false)
  const { isHolder, startCheck, isCheckingHolder } = useHolderCheck()

  // Trigger initial check when component mounts
  useEffect(() => {
    if (walletAddress && isHolder === null && !isCheckingHolder) {
      console.log('Triggering initial holder check')
      startCheck()
    }
  }, [walletAddress, isHolder, isCheckingHolder])

  // Debug logs
  console.log('Follow Button State:', {
    walletAddress,
    isLoggedIn: !!walletAddress,
    isHolder,
    isCheckingHolder,
    showHolderModal,
  })

  // Early return if not applicable
  if (!walletAddress || mainUsername === username) return null

  const buttonClasses = `font-mono rounded transition-colors ${
    size === 'lg' ? 'px-4 py-2 text-sm' : 'px-2 py-1 text-xs'
  }`
  const iconSize = size === 'lg' ? 16 : 14

  const handleFollow = () => {
    if (!mainUsername) return

    // If we don't know holder status yet, check it
    if (isHolder === null) {
      console.log('Starting holder check from follow button')
      startCheck()
      return
    }

    // If we're not a holder, show the modal
    if (!isHolder) {
      console.log('Not a holder, showing modal')
      setShowHolderModal(true)
      return
    }

    // If we are a holder, proceed with the follow
    console.log('Is holder, proceeding with follow')
    setOptimisticFollowing(true)
    followUser({
      followerUsername: mainUsername,
      followeeUsername: username,
    })
      .then(() => {
        mutate()
        fetch(`/api/profiles/${username}`, { method: 'HEAD' })
      })
      .catch((error) => {
        console.error('Failed to follow:', error)
        setOptimisticFollowing(false)
      })
  }

  const handleUnfollow = async () => {
    if (!mainUsername) return

    try {
      await unfollowUser({
        followerUsername: mainUsername,
        followeeUsername: username,
      })
      await mutate()
      await fetch(`/api/profiles/${username}`, { method: 'HEAD' })
      setShowUnfollowConfirm(false)
    } catch (error) {
      console.error('Failed to unfollow:', error)
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
        className={`${buttonClasses} flex items-center gap-1 bg-green-900/30 text-green-400 border border-green-800 hover:bg-green-900/50 disabled:opacity-50`}
      >
        <UserRoundPlus size={iconSize} />
        {loading ? 'Following...' : 'Follow'}
      </button>

      {showHolderModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800 max-w-sm mx-auto">
            <h3 className="text-lg font-semibold mb-2">Holder Required</h3>
            <FrogHolderRequired variant="inline" />
            <button
              onClick={() => setShowHolderModal(false)}
              className="w-full px-4 py-2 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
