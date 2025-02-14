import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { Avatar } from '@/components/common/Avatar'
import type { Profile } from '@/utils/api'
import type { Transaction } from '@/utils/helius/types'
import { route } from '@/utils/routes'
import Link from 'next/link'

export function TransactionCommentView({
  tx,
  sourceWallet,
  destinationWallet,
  amount,
  tokenSymbol,
}: {
  tx: Transaction
  sourceWallet: string
  destinationWallet?: string
  amount?: number
  tokenSymbol?: string
}) {
  const { walletAddress: currentWalletAddress } = useCurrentWallet()

  // Get profiles for both source and destination wallets
  const { profiles: sourceProfiles } = useGetProfiles(sourceWallet)
  const sourceProfile = sourceProfiles?.find(
    (p: Profile) => p.namespace.name === 'nemoapp'
  )?.profile

  const { profiles: destProfiles } = useGetProfiles(destinationWallet || '')
  const destProfile = destProfiles?.find(
    (p: Profile) => p.namespace.name === 'nemoapp'
  )?.profile

  const isOwnComment = currentWalletAddress === sourceWallet
  const isUserToUser = destinationWallet && sourceWallet !== destinationWallet

  // Check if this is a comment with commission (80/20 split)
  const isCommentWithCommission =
    tx.tokenTransfers?.length === 2 &&
    tx.tokenTransfers[0].tokenAmount === 80 &&
    tx.tokenTransfers[1].tokenAmount === 20

  return (
    <div className="flex flex-col p-4 bg-black/20 rounded-lg border border-green-500/10 hover:border-green-500/20 transition-colors">
      {/* Main Content */}
      <div className="flex items-center gap-6">
        {/* Left - Avatars */}
        <div className="flex -space-x-2">
          <Avatar
            username={sourceProfile?.username || sourceWallet}
            size={44}
            imageUrl={sourceProfile?.image}
          />
          {isUserToUser && (
            <div className="relative">
              <Avatar
                username={destProfile?.username || destinationWallet || ''}
                size={44}
                imageUrl={destProfile?.image}
              />
              <div className="absolute -right-1 bottom-0">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-black">
                  <svg
                    className="w-3 h-3 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center - Content */}
        <div className="flex-1 min-w-0">
          {/* User Names and Action */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href={route('address', {
                id: sourceProfile?.username || sourceWallet,
              })}
              className="text-sm font-semibold hover:text-green-400 transition-colors"
            >
              {sourceProfile?.username ? (
                `@${sourceProfile.username}`
              ) : (
                <span className="font-mono">
                  {sourceWallet.slice(0, 4)}...{sourceWallet.slice(-4)}
                </span>
              )}
            </Link>
            <span className="text-sm text-gray-500">
              {sourceWallet === destinationWallet
                ? 'posted on their wall'
                : 'posted on'}
            </span>
            {sourceWallet !== destinationWallet && (
              <Link
                href={route('address', {
                  id: destProfile?.username || destinationWallet || '',
                })}
                className="text-sm font-semibold hover:text-green-400 transition-colors"
              >
                {destProfile?.username ? (
                  `@${destProfile.username}'s`
                ) : destinationWallet ? (
                  <span className="font-mono">
                    {destinationWallet.slice(0, 4)}...
                    {destinationWallet.slice(-4)}
                  </span>
                ) : null}
              </Link>
            )}
            {sourceWallet !== destinationWallet && (
              <span className="text-sm text-gray-500">wall</span>
            )}
          </div>

          {/* Timestamp and Details */}
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span>{new Date(tx.timestamp).toLocaleString()}</span>
            <span>·</span>
            {tx.source && (
              <>
                <span>
                  via{' '}
                  {tx.source === 'SOLANA_PROGRAM_LIBRARY'
                    ? 'TAPESTRY'
                    : tx.source}
                </span>
                <span>·</span>
              </>
            )}
            <Link
              href={route('address', { id: tx.signature })}
              className="hover:text-green-400 transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
