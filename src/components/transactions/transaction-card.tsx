import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { Avatar } from '@/components/common/avatar-container'
import { TimeDisplay } from '@/components/common/time-display'
import { useTransactionType } from '@/hooks/use-transaction-type'
import type { Profile } from '@/utils/api'
import { route } from '@/utils/routes'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { memo, useMemo } from 'react'
import { NFTTransactionView } from './nft-transaction-view'
import { SolanaTransferView } from './solana-transfer-view'
import { SPLTransferView } from './spl-transfer-view'
import { SwapTransactionView } from './swap-transaction-view'
import { TransactionBadge } from './transaction-badge'
import { TransactionCommentView } from './transaction-comment-view'
import {
  BaseTransactionDisplayProps,
  transformToExtendedTransaction,
} from './transaction-utils'
import { TransferList } from './transfer-list'

const COMMISSION_WALLET = '8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz'

export const TransactionCard = memo(function TransactionCard({
  transaction: tx,
  sourceWallet,
}: BaseTransactionDisplayProps) {
  // Memoize expensive computations and transformations
  const { extendedTransaction } = useMemo(
    () => ({
      extendedTransaction: transformToExtendedTransaction(tx),
    }),
    [tx]
  )

  const t = useTranslations()

  const {
    isComment,
    isSwap,
    isSolanaTransfer,
    isSPLTransfer,
    isNFTTransaction,
  } = useTransactionType(tx)

  // Add profile lookup for source wallet
  const { profiles: sourceProfiles } = useGetProfiles(sourceWallet)
  const sourceProfile = sourceProfiles?.find(
    (p: Profile) => p.namespace.name === 'nemoapp'
  )?.profile

  // For comments, we want to show the destination as the wallet receiving 80%
  const destinationWallet = isComment
    ? tx.tokenTransfers?.find((t) => t.to !== COMMISSION_WALLET)?.to
    : tx.nativeTransfers?.[0]?.toUserAccount

  // If this is a comment, use the TransactionCommentView
  if (isComment) {
    return (
      <div className="p-2 sm:p-3 hover:bg-green-900/10 transition-all duration-200">
        <TransactionCommentView
          tx={tx}
          sourceWallet={sourceWallet}
          destinationWallet={destinationWallet}
          amount={100} // Total amount (80 + 20)
          tokenSymbol="SSE"
        />
      </div>
    )
  }

  return (
    <div className="p-2 sm:p-3 hover:bg-green-900/10 transition-all duration-200">
      <div className="flex flex-col gap-2">
        {/* Top Row: Signature, Badges, and Time */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={route('address', { id: tx.signature })}>
              <span className=" font-mono text-xs sm:text-sm font-bold px-2 py-0.5 bg-green-900/20 rounded border border-green-800/30 hover:border-green-700/40 transition-colors">
                {tx.signature.slice(0, 4)}...{tx.signature.slice(-4)}
              </span>
            </Link>
            <TransactionBadge type={tx.type} source={tx.source} />
            {sourceWallet && (
              <div className="flex items-center gap-2">
                <Avatar
                  username={sourceProfile?.username || sourceWallet}
                  size={20}
                  imageUrl={sourceProfile?.image}
                />
                {sourceProfile?.username ? (
                  <Link
                    href={route('address', { id: sourceProfile.username })}
                    className="text-gray-300 hover: transition-colors text-xs"
                  >
                    @{sourceProfile.username}
                  </Link>
                ) : (
                  <Link
                    href={route('address', { id: sourceWallet })}
                    className="text-gray-300 font-mono text-xs px-2 py-0.5 bg-gray-900/20 rounded border border-gray-800/30 hover:border-gray-700/40 transition-colors"
                  >
                    <span className="text-gray-400">wallet:</span>{' '}
                    {sourceWallet.slice(0, 4)}...{sourceWallet.slice(-4)}
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono">
            <TimeDisplay timestamp={tx.timestamp} />
            {tx.fee && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-900/20 rounded border border-green-800/30">
                <svg
                  className="w-3 h-3 "
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="">{Number(tx.fee)} SOL</span>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Description */}
        {tx.source !== 'MAGIC_EDEN' &&
          tx.source !== 'SOLANA_PROGRAM_LIBRARY' &&
          tx.type !== 'COMPRESSED_NFT_MINT' &&
          tx.type !== 'SWAP' &&
          tx.type !== 'TRANSFER' && (
            <div className="text-xs sm:text-sm text-green-300 font-mono break-words">
              {tx.description || t('transaction_log.no_description_available')}
            </div>
          )}

        {/* Custom Views Container */}
        <div className="space-y-2">
          {/* Custom Swap View for SWAP transactions */}
          {isSwap && (
            <SwapTransactionView tx={tx} sourceWallet={sourceWallet} />
          )}

          {/* Custom Solana Transfer View for SYSTEM_PROGRAM transfers */}
          {isSolanaTransfer && (
            <SolanaTransferView tx={tx} sourceWallet={sourceWallet} />
          )}

          {/* Custom SPL Token Transfer View for SOLANA_PROGRAM_LIBRARY transfers */}
          {isSPLTransfer && (
            <SPLTransferView tx={tx} sourceWallet={sourceWallet} />
          )}

          {/* NFT Transaction View for MAGIC_EDEN and TENSOR */}
          {isNFTTransaction && (
            <NFTTransactionView
              tx={extendedTransaction}
              sourceWallet={sourceWallet}
            />
          )}

          {/* Transfers */}
          {!isComment && !isSolanaTransfer && !isSPLTransfer && (
            <TransferList
              nativeTransfers={tx.nativeTransfers}
              tokenTransfers={tx.tokenTransfers}
              sourceWallet={sourceWallet}
            />
          )}
        </div>
      </div>
    </div>
  )
})
