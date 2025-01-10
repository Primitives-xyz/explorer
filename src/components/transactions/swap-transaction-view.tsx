import { formatNumber } from '@/utils/format'
import { Transaction } from '@/utils/helius/types'
import { useState } from 'react'
interface TokenTransfer {
  fromTokenAccount: string
  toTokenAccount: string
  fromUserAccount: string
  toUserAccount: string
  tokenAmount: number
  mint: string
  tokenStandard: string
}

export function SwapTransactionView({
  tx,
  sourceWallet,
}: {
  tx: Transaction
  sourceWallet: string
}) {
  const [tokenAddress, setTokenAddress] = useState('')
  if (tx.source === 'JUPITER') {
    console.log({ tokenTransfers: tx.tokenTransfers })
    console.log({ tx })
  }

  // Find the token transfer that represents the token being swapped from (outgoing)
  const fromTransfer = tx.tokenTransfers?.find(
    (transfer: TokenTransfer) => transfer.fromUserAccount === sourceWallet,
  )
  // Find the token transfer that represents the token being swapped to (incoming)
  const toTransfer = tx.tokenTransfers?.find(
    (transfer: TokenTransfer) => transfer.toUserAccount === sourceWallet,
  )

  if (!fromTransfer || !toTransfer) return null

  return (
    <div className="flex items-center gap-2 p-2 bg-green-900/10 rounded-lg">
      {/* From Token */}
      <div className="flex-1 flex items-center gap-2">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-sm"></div>
          <div className="w-8 h-8 rounded-lg bg-black/40 ring-1 ring-green-500/20 flex items-center justify-center relative z-[1]">
            <span className="text-green-500 font-mono text-xs">
              {fromTransfer.mint.slice(0, 2)}
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-green-400 font-mono text-xs">
            {formatNumber(fromTransfer.tokenAmount)}
          </span>
          <span className="text-green-600 font-mono text-xs">
            {fromTransfer.mint.slice(0, 4)}...{fromTransfer.mint.slice(-4)}
          </span>
        </div>
      </div>

      {/* Swap Icon */}
      <div className="flex-shrink-0">
        <div className="w-6 h-6 bg-green-900/30 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        </div>
      </div>

      {/* To Token */}
      <div className="flex-1 flex items-center gap-2">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/10 rounded-lg filter blur-sm"></div>
          <div className="w-8 h-8 rounded-lg bg-black/40 ring-1 ring-green-500/20 flex items-center justify-center relative z-[1]">
            <span className="text-green-500 font-mono text-xs">
              {toTransfer.mint.slice(0, 2)}
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-green-400 font-mono text-xs">
            {formatNumber(toTransfer.tokenAmount)}
          </span>
          <span className="text-green-600 font-mono text-xs">
            {toTransfer.mint.slice(0, 4)}...{toTransfer.mint.slice(-4)}
          </span>
        </div>
      </div>
    </div>
  )
}
