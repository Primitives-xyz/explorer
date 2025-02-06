import { useFollowWallet } from './hooks/use-follow-wallet'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { UserRoundPlus, LoaderCircle } from 'lucide-react'
import { Alert } from '../common/alert'
import dynamic from 'next/dynamic'

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
  const { followWallet, loading, success } = useFollowWallet()

  const buttonClasses = `font-mono rounded-lg transition-all active:scale-95 md:hover:scale-105 ${
    size === 'lg'
      ? 'px-6 py-3 text-base'
      : 'px-4 py-2 text-sm md:px-3 md:py-1.5 md:text-xs'
  }`
  const iconSize = size === 'lg' ? 18 : 16

  // Show loading state while initializing
  if (isLoggedIn && loading) {
    return (
      <div
        className={`${buttonClasses} flex items-center justify-center gap-2 bg-neutral-900/30 text-neutral-400 border border-neutral-800`}
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

    try {
      await followWallet({
        followerUsername: mainUsername,
        walletToFollow: walletAddress,
      })
    } catch (error) {
      console.error('Failed to follow wallet:', error)
    }
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

      {success && (
        <Alert
          type="success"
          message="Followed wallet successfully!"
          duration={5000}
        />
      )}
    </>
  )
}
