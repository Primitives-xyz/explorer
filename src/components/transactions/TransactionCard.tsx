import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { formatLamportsToSol } from '@/utils/transaction'
import { TransactionBadge } from './TransactionBadge'
import { TransactionSignature } from './TransactionSignature'
import { TransferList } from './TransferList'
import { Transaction } from '@/utils/helius/types'
import { SwapTransactionView } from './swap-transaction-view'
import { SolanaTransferView } from './solana-transfer-view'
import { NFTTransactionView } from './nft-transaction-view'
import { SPLTransferView } from './spl-transfer-view'
import { ExtendedTransaction } from '@/utils/nft-transaction'
import { memo, useMemo } from 'react'

// Helper function to normalize timestamp
const normalizeTimestamp = (timestamp: number) => {
  // If timestamp is in seconds (less than year 2100 in milliseconds)
  if (timestamp < 4102444800) {
    return timestamp * 1000
  }
  return timestamp
}

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
  const { formattedTime, extendedTransaction } = useMemo(
    () => ({
      formattedTime: formatDistanceToNow(
        new Date(normalizeTimestamp(tx.timestamp)),
        {
          addSuffix: true,
        },
      ),
      extendedTransaction: transformToExtendedTransaction(tx),
    }),
    [tx],
  )

  return (
    <div className="p-2 hover:bg-green-900/10 transition-all duration-200">
      <div className="flex flex-col gap-1">
        {/* Top Row: Signature, Badges, and Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={`/${tx.signature}`}>
              <span className="text-green-300 font-mono text-sm font-bold px-2 py-0.5 bg-green-900/20 rounded border border-green-800/30">
                {tx.signature.slice(0, 4)}...{tx.signature.slice(-4)}
              </span>
            </Link>
            <TransactionBadge type={tx.type} source={tx.source} />
            {sourceWallet && (
              <Link href={`/${sourceWallet}`}>
                <span className="text-gray-300 font-mono text-xs px-2 py-0.5 bg-gray-900/20 rounded border border-gray-800/30">
                  {sourceWallet.slice(0, 4)}...{sourceWallet.slice(-4)}
                </span>
              </Link>
            )}
          </div>
          <div className="flex flex-col items-end text-xs">
            <span className="text-green-400 font-mono">{formattedTime}</span>
            <span className="text-green-600 font-mono">
              {tx.fee ? `${Number(tx.fee)} SOL` : ''}
            </span>
          </div>
        </div>

        {/* Transaction Description */}
        {tx.source !== 'MAGIC_EDEN' &&
          tx.source !== 'SOLANA_PROGRAM_LIBRARY' &&
          tx.type !== 'COMPRESSED_NFT_MINT' && (
            <div className="text-sm text-green-300 font-mono break-words">
              {tx.description || 'No description available'}
            </div>
          )}

        {/* Custom Swap View for SWAP transactions */}
        {tx.type === 'SWAP' && (
          <SwapTransactionView tx={tx} sourceWallet={sourceWallet} />
        )}

        {/* Custom Solana Transfer View for SYSTEM_PROGRAM transfers */}
        {tx.source === 'SYSTEM_PROGRAM' && tx.type === 'TRANSFER' && (
          <SolanaTransferView tx={tx} sourceWallet={sourceWallet} />
        )}

        {/* Custom SPL Token Transfer View for SOLANA_PROGRAM_LIBRARY transfers */}
        {(tx.source === 'SOLANA_PROGRAM_LIBRARY' || tx.source === 'PHANTOM') &&
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
  )
})
