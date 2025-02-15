import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { Avatar } from '@/components/common/avatar'
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
          </div>
        </div>

        {/* Transaction Description */}
        {tx.source !== 'MAGIC_EDEN' &&
          tx.source !== 'SOLANA_PROGRAM_LIBRARY' &&
          tx.type !== 'COMPRESSED_NFT_MINT' &&
          tx.type !== 'SWAP' &&
          tx.type !== 'TRANSFER' && (
            <div className="text-xs sm:text-sm font-mono break-words">
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
