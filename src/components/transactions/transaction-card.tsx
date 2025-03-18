import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { TimeDisplay } from '@/components/common/time-display'
import { useToast } from '@/hooks/use-toast'
import { useTransactionType } from '@/hooks/use-transaction-type'
import { IGetProfileResponse } from '@/types/profile.types'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { route } from '@/utils/routes'
import { ClipboardIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { memo, useMemo } from 'react'
import { NFTTransactionView } from './nft-transaction-view'
import { SolanaTransferView } from './solana-transfer-view'
import { SPLTransferView } from './spl-transfer-view'
import { SwapTransactionView } from './swap-transaction-view'
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
  console.log(tx)
  // Memoize expensive computations
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

  // Profile lookup for source wallet
  const { profiles: sourceProfiles } = useGetProfiles(sourceWallet)
  const sourceProfile = sourceProfiles?.find(
    (p: IGetProfileResponse) => p.namespace.name === EXPLORER_NAMESPACE
  )?.profile

  // Determine destination wallet for comments
  const destinationWallet = isComment
    ? tx.tokenTransfers?.find((t) => t.to !== COMMISSION_WALLET)?.to
    : tx.nativeTransfers?.[0]?.toUserAccount

  // Compute primary transaction type
  const primaryType = useMemo(() => {
    if (isComment) return 'COMMENT'
    if (isSwap) return 'SWAP'
    if (isSolanaTransfer) return 'SOL TRANSFER'
    if (isSPLTransfer) return 'SPL TRANSFER'
    if (isNFTTransaction) return 'NFT'
    return 'OTHER'
  }, [isComment, isSwap, isSolanaTransfer, isSPLTransfer, isNFTTransaction])
  const { toast } = useToast()
  // Handle signature copy
  const handleCopy = () => {
    navigator.clipboard.writeText(tx.signature)
    toast({
      title: 'Signature copied to clipboard',
      description: 'You can now paste it into the explorer',
    })
  }

  // Comment transactions get a special view
  if (isComment) {
    return (
      <div className="p-2 sm:p-3 hover:bg-green-900/10 transition-all duration-200">
        <TransactionCommentView
          tx={tx}
          sourceWallet={sourceWallet}
          destinationWallet={destinationWallet}
          amount={100}
          tokenSymbol="SSE"
        />
      </div>
    )
  }

  console.log("Swap", isSwap, sourceWallet)

  return (
    <div className="p-2 sm:p-3 hover:bg-green-900/10 transition-all duration-200">
      <div className="flex flex-col gap-2">
        {/* Top Row: Signature, Copy, Explorer, Type Badge, Timestamp, Fee */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Signature */}
            <Link href={route('address', { id: tx.signature })}>
              <span className="font-mono text-xs sm:text-sm font-bold px-2 py-0.5 bg-green-900/20 rounded border border-green-800/30 hover:border-green-700/40 transition-colors">
                {tx.signature.slice(0, 4)}...{tx.signature.slice(-4)}
              </span>
            </Link>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-1 rounded bg-green-900/20 border border-green-800/30 hover:border-green-700/40 transition-colors"
              title="Copy signature"
            >
              <ClipboardIcon className="w-4 h-4" />
            </button>

            {/* Transaction Type Badge */}
            <span className="px-1 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 rounded">
              {primaryType}
            </span>
          </div>

          {/* Timestamp and Fee */}
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono">
            <TimeDisplay timestamp={tx.timestamp} />
            {tx.fee && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-900/20 rounded border border-green-800/30">
                <svg
                  className="w-3 h-3"
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
                <span>{Number(tx.fee)} SOL</span>
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
            <div className="text-xs sm:text-sm font-mono break-words">
              {tx.description || t('transaction_log.no_description_available')}
            </div>
          )}

        {/* Custom Views Container */}
        <div className="space-y-2">
          {isSwap && (
            <SwapTransactionView tx={tx} sourceWallet={sourceWallet} />
          )}
          {isSolanaTransfer && (
            <SolanaTransferView tx={tx} sourceWallet={sourceWallet} />
          )}
          {isSPLTransfer && (
            <SPLTransferView tx={tx} sourceWallet={sourceWallet} />
          )}
          {isNFTTransaction && (
            <NFTTransactionView
              tx={extendedTransaction}
              sourceWallet={sourceWallet}
            />
          )}
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
