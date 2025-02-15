import { useToast } from '@/hooks/use-toast'
import { useWalletFollowStats } from '@/hooks/use-wallet-follow-stats'
import { LoaderCircle, UserRoundCheck, UserRoundPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { useFollowWallet } from './hooks/use-follow-wallet'

const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton
    ),
  { ssr: false }
)

interface Props {
  walletAddress: string
  size?: 'sm' | 'lg'
}

export function WalletFollowButton({ walletAddress, size = 'sm' }: Props) {
  const { mainUsername, isLoggedIn, sdkHasLoaded } = useCurrentWallet()
  const { followWallet, unfollowWallet, loading, success } = useFollowWallet()
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false)

  const t = useTranslations()

  const {
    isFollowing,
    isLoading: isLoadingStats,
    mutate: mutateStats,
  } = useWalletFollowStats(walletAddress, mainUsername)
  const [optimisticFollowing, setOptimisticFollowing] = useState<
    boolean | null
  >(null)
  const { toast } = useToast()

  const buttonClasses = `font-mono rounded-lg transition-all active:scale-95 md:hover:scale-105 ${
    size === 'lg'
      ? 'px-6 py-3 text-base'
      : 'px-4 py-2 text-sm md:px-3 md:py-1.5 md:text-xs'
  }`
  const iconSize = size === 'lg' ? 18 : 16

  // Watch for success state changes
  useEffect(() => {
    if (success) {
      toast({
        title: t('common.success'),
        description: t('success.successfully_followed_wallet'),
        variant: 'default',
      })
    }
  }, [success, toast])

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
    mutateStats()
  }, [walletAddress, mainUsername, mutateStats])

  // Show loading state while initializing
  if (isLoggedIn && (isLoadingStats || optimisticFollowing === null)) {
    return (
      <div
        className={`${buttonClasses} flex items-center justify-center gap-2 bg-neutral-900/30 text-neutral-400 border border-neutral-800`}
      >
        <LoaderCircle className="animate-spin" size={iconSize} />
        <span>{t('common.loading')}...</span>
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
          className={`${buttonClasses} flex items-center justify-center gap-2 bg-green-900/30  border border-green-800 hover:bg-green-900/50 active:bg-green-900/70 cursor-pointer shadow-lg shadow-green-900/20`}
        >
          <UserRoundPlus size={iconSize} />
          {t('common.connect_wallet')}
        </div>
      </DynamicConnectButton>
    )
  }

  const handleFollow = async () => {
    if (!mainUsername) return

    setOptimisticFollowing(true)

    const success = await followWallet({
      followerUsername: mainUsername,
      walletToFollow: walletAddress,
    })

    if (success) {
      toast({
        title: t('common.success'),
        description: t('success.successfully_followed_wallet'),
        variant: 'success',
        duration: 5000,
      })
      mutateStats()
    } else {
      setOptimisticFollowing(false)
      toast({
        title: t('common.error'),
        description: t('error.failed_to_follow_wallet_please_try_again'),
        variant: 'error',
        duration: 5000,
      })
    }
  }

  const handleUnfollow = async () => {
    if (!mainUsername) return

    setOptimisticFollowing(false)

    const success = await unfollowWallet({
      followerUsername: mainUsername,
      walletToFollow: walletAddress,
    })

    if (success) {
      toast({
        title: t('common.success'),
        description: t('success.successfully_unfollowed_wallet'),
        variant: 'success',
        duration: 5000,
      })
      setShowUnfollowConfirm(false)
      mutateStats()
    } else {
      setOptimisticFollowing(true)
      toast({
        title: t('common.error'),
        description: t('common.failed_to_unfollow_wallet_please_try_again'),
        variant: 'error',
        duration: 5000,
      })
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
              className={`${buttonClasses} flex items-center justify-center gap-2 bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50 disabled:opacity-50`}
            >
              {loading ? (
                <LoaderCircle className="animate-spin" size={iconSize} />
              ) : (
                <UserRoundPlus size={iconSize} />
              )}
              {loading ? `${t('common.unfollowing')}...` : t('common.confirm')}
            </button>
            <button
              onClick={() => setShowUnfollowConfirm(false)}
              disabled={loading}
              className={`${buttonClasses} flex items-center justify-center gap-2 bg-neutral-900/30 text-neutral-400 border border-neutral-800 hover:bg-neutral-900/50`}
            >
              {t('common.cancel')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowUnfollowConfirm(true)}
            className={`${buttonClasses} flex items-center justify-center gap-2 bg-neutral-900/30 text-neutral-400 border border-neutral-800 hover:bg-neutral-900/50 active:bg-neutral-900/70 shadow-lg shadow-neutral-900/20`}
          >
            <UserRoundCheck size={iconSize} />
            {t('common.following')}
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
        className={`${buttonClasses} flex items-center justify-center gap-2 bg-green-900/30  border border-green-800 hover:bg-green-900/50 active:bg-green-900/70 disabled:opacity-50 shadow-lg shadow-green-900/20`}
      >
        {loading ? (
          <LoaderCircle className="animate-spin" size={iconSize} />
        ) : (
          <UserRoundPlus size={iconSize} />
        )}
        {loading ? `${t('common.following')}...` : t('common.follow_wallet')}
      </button>
    </>
  )
}
