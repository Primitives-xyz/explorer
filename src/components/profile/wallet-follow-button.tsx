import { useFollowWallet } from './hooks/use-follow-wallet'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { UserRoundPlus, UserRoundCheck, LoaderCircle } from 'lucide-react'
import { Alert } from '../common/alert'
import dynamic from 'next/dynamic'
import { useWalletFollowStats } from '@/hooks/use-wallet-follow-stats'
import { useState, useEffect } from 'react'

const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton,
    ),
  { ssr: false },
)

interface Props {
  walletAddress: string
  size?: 'sm' | 'lg'
}

export function WalletFollowButton({ walletAddress, size = 'sm' }: Props) {
  const { mainUsername, isLoggedIn, sdkHasLoaded } = useCurrentWallet()
  const { followWallet, unfollowWallet, loading, success } = useFollowWallet()
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false)
  const {
    isFollowing,
    isLoading: isLoadingStats,
    mutate: mutateStats,
  } = useWalletFollowStats(walletAddress, mainUsername)
  const [optimisticFollowing, setOptimisticFollowing] = useState<
    boolean | null
  >(null)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const buttonClasses = `font-mono rounded-lg transition-all active:scale-95 md:hover:scale-105 ${
    size === 'lg'
      ? 'px-6 py-3 text-base'
      : 'px-4 py-2 text-sm md:px-3 md:py-1.5 md:text-xs'
  }`
  const iconSize = size === 'lg' ? 18 : 16

  // Initialize optimistic state when actual state is loaded
  useEffect(() => {
    if (
      !isLoadingStats &&
      isFollowing !== undefined &&
      optimisticFollowing === null
    ) {
      setOptimisticFollowing(isFollowing)
    }
  }, [isFollowing, isLoadingStats, optimisticFollowing])

  // Reset states when wallet changes
  useEffect(() => {
    setOptimisticFollowing(null)
    setShowUnfollowConfirm(false)
    setShowSuccessAlert(false)
    mutateStats()
  }, [walletAddress, mainUsername, mutateStats])

  // Show loading state while initializing
  if (isLoggedIn && (isLoadingStats || optimisticFollowing === null)) {
    return (
      <div
        className={`${buttonClasses} flex items-center justify-center gap-2 bg-neutral-900/30 text-neutral-400 border border-neutral-800`}
      >
        <LoaderCircle className="animate-spin" size={iconSize} />
        <span>Loading...</span>
      </div>
    )
  }

  if (!sdkHasLoaded) {
    return null
  }

  // If not logged in or SDK hasn't loaded, show follow button that triggers connect wallet
  if (!isLoggedIn || !sdkHasLoaded) {
    return (
      <DynamicConnectButton>
        <div
          className={`${buttonClasses} flex items-center justify-center gap-2 bg-green-900/30 text-green-400 border border-green-800 hover:bg-green-900/50 active:bg-green-900/70 cursor-pointer shadow-lg shadow-green-900/20`}
        >
          <UserRoundPlus size={iconSize} />
          Follow Wallet
        </div>
      </DynamicConnectButton>
    )
  }

  const handleFollow = async () => {
    if (!mainUsername) return

    setOptimisticFollowing(true)

    try {
      await followWallet({
        followerUsername: mainUsername,
        walletToFollow: walletAddress,
      })
      setShowSuccessAlert(true)
      setAlertMessage('Successfully followed wallet!')
      mutateStats()
    } catch (error) {
      console.error('Failed to follow wallet:', error)
      setOptimisticFollowing(false)
      setShowSuccessAlert(true)
      setAlertMessage('Failed to follow wallet. Please try again.')
    }
  }

  const handleUnfollow = async () => {
    if (!mainUsername) return

    setOptimisticFollowing(false)

    try {
      await unfollowWallet({
        followerUsername: mainUsername,
        walletToFollow: walletAddress,
      })
      setShowSuccessAlert(true)
      setAlertMessage('Successfully unfollowed wallet')
      setShowUnfollowConfirm(false)
      mutateStats()
    } catch (error) {
      console.error('Failed to unfollow wallet:', error)
      setOptimisticFollowing(true)
      setShowSuccessAlert(true)
      setAlertMessage('Failed to unfollow wallet. Please try again.')
    }
  }

  if (optimisticFollowing) {
    return (
      <>
        {showUnfollowConfirm ? (
          <div className="flex gap-1">
            <button
              onClick={handleUnfollow}
              disabled={loading}
              className={`${buttonClasses} bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50 disabled:opacity-50`}
            >
              {loading ? 'Unfollowing...' : 'Confirm Unfollow'}
            </button>
            <button
              onClick={() => setShowUnfollowConfirm(false)}
              disabled={loading}
              className={`${buttonClasses} bg-neutral-900/30 text-neutral-400 border border-neutral-800 hover:bg-neutral-900/50`}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowUnfollowConfirm(true)}
            className={`${buttonClasses} flex items-center justify-center gap-2 bg-neutral-900/30 text-neutral-400 border border-neutral-800 hover:bg-neutral-900/50 active:bg-neutral-900/70 shadow-lg shadow-neutral-900/20`}
          >
            <UserRoundCheck size={iconSize} />
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
        className={`${buttonClasses} flex items-center justify-center gap-2 bg-green-900/30 text-green-400 border border-green-800 hover:bg-green-900/50 active:bg-green-900/70 disabled:opacity-50 shadow-lg shadow-green-900/20`}
      >
        <UserRoundPlus size={iconSize} />
        {loading ? 'Following...' : 'Follow Wallet'}
      </button>

      {showSuccessAlert && (
        <Alert
          type={alertMessage.includes('Failed') ? 'error' : 'success'}
          message={alertMessage}
          duration={5000}
        />
      )}
    </>
  )
}
