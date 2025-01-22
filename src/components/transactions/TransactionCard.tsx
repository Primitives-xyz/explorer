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

// Helper function to normalize timestamp
const normalizeTimestamp = (timestamp: number) => {
  // If timestamp is in seconds (less than year 2100 in milliseconds)
  if (timestamp < 4102444800) {
    return timestamp * 1000
  }
  return timestamp
}

// Helper function to transform Transaction to ExtendedTransaction
const transformToExtendedTransaction = (
  tx: Transaction,
): ExtendedTransaction => {
  return {
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
  }
}

interface TransactionCardProps {
  transaction: Transaction
  sourceWallet: string
  isExpanded: boolean
  onExpand: () => void
}

export const TransactionCard = ({
  transaction: tx,
  sourceWallet,
  isExpanded,
  onExpand,
}: TransactionCardProps) => {
  return (
    <div
      className="p-2 hover:bg-green-900/10 cursor-pointer transition-all duration-200"
      onClick={onExpand}
    >
      <div className="flex flex-col gap-1">
        {/* Top Row: Signature, Badges, and Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href={`/${tx.signature}`}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-green-300 font-mono text-sm font-bold px-2 py-0.5 bg-green-900/20 rounded border border-green-800/30">
                {tx.signature.slice(0, 4)}...{tx.signature.slice(-4)}
              </span>
            </Link>
            <TransactionBadge type={tx.type} source={tx.source} />
            {sourceWallet && (
              <span className="text-gray-300 font-mono text-xs px-2 py-0.5 bg-gray-900/20 rounded border border-gray-800/30">
                {sourceWallet.slice(0, 4)}...{sourceWallet.slice(-4)}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end text-xs">
            <span className="text-green-400 font-mono">
              {formatDistanceToNow(new Date(normalizeTimestamp(tx.timestamp)), {
                addSuffix: true,
              })}
            </span>
            <span className="text-green-600 font-mono">
              {tx.fee ? `${Number(tx.fee)} SOL` : ''}
            </span>
          </div>
        </div>

        {/* Transaction Description */}
        {tx.source !== 'MAGIC_EDEN' &&
          tx.source !== 'SOLANA_PROGRAM_LIBRARY' && (
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
        {tx.source === 'SOLANA_PROGRAM_LIBRARY' && tx.type === 'TRANSFER' && (
          <SPLTransferView tx={tx} sourceWallet={sourceWallet} />
        )}

        {/* NFT Transaction View for MAGIC_EDEN and TENSOR */}
        {(tx.source === 'MAGIC_EDEN' ||
          tx.source === 'TENSOR' ||
          tx.sourceWallet) && (
          <NFTTransactionView
            tx={transformToExtendedTransaction(tx)}
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

        {/* Parsed Instructions (Expanded View) */}
        {isExpanded && tx.parsedInstructions && (
          <div className="mt-2 space-y-2">
            <div className="text-xs text-green-400 font-mono">
              Instructions:
            </div>
            {tx.parsedInstructions.map((ix: any, index: number) => (
              <div key={index} className="pl-2 border-l-2 border-green-800">
                <div className="text-xs text-green-500 font-mono">
                  Program: {ix.programId.slice(0, 4)}...{ix.programId.slice(-4)}
                </div>
                {ix.decodedData && (
                  <div className="text-xs text-green-400 font-mono pl-2 mt-1">
                    <pre className="whitespace-pre-wrap break-all">
                      {JSON.stringify(ix.decodedData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
