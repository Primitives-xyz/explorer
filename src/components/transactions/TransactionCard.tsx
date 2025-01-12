import { formatDistanceToNow } from 'date-fns'
import { formatLamportsToSol } from '@/utils/transaction'
import { TransactionBadge } from './TransactionBadge'
import { TransactionSignature } from './TransactionSignature'
import { TransferList } from './TransferList'
import { Transaction } from '@/utils/helius/types'
import { SwapTransactionView } from './swap-transaction-view'
import { SolanaTransferView } from './solana-transfer-view'
import { NFTTransactionView } from './nft-transaction-view'

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
            <span className="text-green-300 font-mono text-sm font-bold px-2 py-0.5 bg-green-900/20 rounded border border-green-800/30">
              {tx.signature.slice(0, 4)}...{tx.signature.slice(-4)}
            </span>
            <TransactionBadge type={tx.type} source={tx.source} />
          </div>
          <div className="flex flex-col items-end text-xs">
            <span className="text-green-400 font-mono">
              {formatDistanceToNow(new Date(tx.timestamp), {
                addSuffix: true,
              })}
            </span>
            <span className="text-green-600 font-mono">
              {tx.fee ? `${Number(tx.fee)} SOL` : ''}
            </span>
          </div>
        </div>

        {/* Transaction Description */}
        <div className="text-sm text-green-300 font-mono break-words">
          {tx.description || 'No description available'}
        </div>

        {/* Custom Swap View for SWAP transactions */}
        {tx.type === 'SWAP' && (
          <SwapTransactionView tx={tx} sourceWallet={sourceWallet} />
        )}

        {/* Custom Solana Transfer View for SYSTEM_PROGRAM transfers */}
        {tx.source === 'SYSTEM_PROGRAM' && tx.type === 'TRANSFER' && (
          <SolanaTransferView tx={tx} sourceWallet={sourceWallet} />
        )}
        {(tx.source === 'MAGIC_EDEN' || tx.source === 'TENSOR') && (
          <NFTTransactionView tx={tx} sourceWallet={sourceWallet} />
        )}

        {/* Transfers */}
        {tx.source !== 'SYSTEM_PROGRAM' && (
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
