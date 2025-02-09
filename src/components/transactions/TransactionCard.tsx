import Link from 'next/link'
import { TransactionBadge } from './TransactionBadge'
import { TransferList } from './TransferList'
import type { Transaction } from '@/utils/helius/types'
import { SwapTransactionView } from './swap-transaction-view'
import { SolanaTransferView } from './solana-transfer-view'
import { NFTTransactionView } from './nft-transaction-view'
import { SPLTransferView } from './spl-transfer-view'
import type { ExtendedTransaction } from '@/utils/nft-transaction'
import { memo, useMemo } from 'react'
import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { Avatar } from '@/components/common/Avatar'
import { TimeDisplay } from '@/components/common/TimeDisplay'
import type { Profile } from '@/utils/api'

// Move helper function outside component to prevent recreation
const transformToExtendedTransaction = (
  tx: Transaction,
): ExtendedTransaction => ({
  ...tx,
  tokenTransfers:
    tx.tokenTransfers?.map((transfer) => ({
      fromTokenAccount: transfer.fromTokenAccount,
      toTokenAccount: transfer.toTokenAccount,
      fromUserAccount: transfer.fromUserAccount,
      toUserAccount: transfer.toUserAccount,
      tokenAmount: transfer.tokenAmount,
      mint: transfer.tokenMint,
      tokenStandard: transfer.tokenStandard,
    })) || [],
  transfers:
    tx.nativeTransfers?.map((transfer) => ({
      from: transfer.fromUserAccount,
      to: transfer.toUserAccount,
      amount: transfer.amount,
    })) || [],
})

interface TransactionCardProps {
  transaction: Transaction
  sourceWallet: string
}

export const TransactionCard = memo(function TransactionCard({
  transaction: tx,
  sourceWallet,
}: TransactionCardProps) {
  // Memoize expensive computations and transformations
  const { extendedTransaction } = useMemo(
    () => ({
      extendedTransaction: transformToExtendedTransaction(tx),
    }),
    [tx],
  )

  // Add profile lookup for source wallet
  const { profiles: sourceProfiles } = useGetProfiles(sourceWallet)
  const sourceProfile = sourceProfiles?.find(
    (p: Profile) => p.namespace.name === 'nemoapp',
  )?.profile

  return (
    <div className="p-2 sm:p-3 hover:bg-green-900/10 transition-all duration-200">
      <div className="flex flex-col gap-2">
        {/* Top Row: Signature, Badges, and Time */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/${tx.signature}`}>
              <span className="text-green-300 font-mono text-xs sm:text-sm font-bold px-2 py-0.5 bg-green-900/20 rounded border border-green-800/30 hover:border-green-700/40 transition-colors">
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
                    href={`/${sourceProfile.username}`}
                    className="text-gray-300 hover:text-green-400 transition-colors text-xs"
                  >
                    @{sourceProfile.username}
                  </Link>
                ) : (
                  <Link
                    href={`/${sourceWallet}`}
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
                  className="w-3 h-3 text-green-500"
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
                <span className="text-green-400">{Number(tx.fee)} SOL</span>
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
              {tx.description || 'No description available'}
            </div>
          )}

        {/* Custom Views Container */}
        <div className="space-y-2">
          {/* Custom Swap View for SWAP transactions */}
          {tx.type === 'SWAP' && (
            <SwapTransactionView tx={tx} sourceWallet={sourceWallet} />
          )}

          {/* Custom Solana Transfer View for SYSTEM_PROGRAM transfers */}
          {tx.source === 'SYSTEM_PROGRAM' && tx.type === 'TRANSFER' && (
            <SolanaTransferView tx={tx} sourceWallet={sourceWallet} />
          )}

          {/* Custom SPL Token Transfer View for SOLANA_PROGRAM_LIBRARY transfers */}
          {(tx.source === 'SOLANA_PROGRAM_LIBRARY' ||
            tx.source === 'PHANTOM') &&
            tx.type === 'TRANSFER' && (
              <SPLTransferView tx={tx} sourceWallet={sourceWallet} />
            )}

          {/* NFT Transaction View for MAGIC_EDEN and TENSOR */}
          {(tx.source === 'MAGIC_EDEN' ||
            tx.source === 'TENSOR' ||
            tx.type === 'COMPRESSED_NFT_MINT') && (
            <NFTTransactionView
              tx={extendedTransaction}
              sourceWallet={sourceWallet}
            />
          )}

          {/* Transfers */}
          {tx.source !== 'SYSTEM_PROGRAM' &&
            tx.source !== 'SOLANA_PROGRAM_LIBRARY' && (
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
