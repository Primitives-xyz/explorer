'use client'

import { Transaction } from '@/components/tapestry/models/helius.models'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDownUp, Coins } from 'lucide-react'
import { useState } from 'react'
import { SwapLine } from '../common/swap-line'
import { TransferLine } from '../common/transfer-line'
import {
  getSwapPairsFromTokenTransfers,
  getTokenFeeTransfers,
} from '../swap-transaction/swap-transaction-utils'

interface TransactionTokenTransfersProps {
  transaction: Transaction
}

export function TransactionTokenTransfers({
  transaction,
}: TransactionTokenTransfersProps) {
  const [viewMode, setViewMode] = useState<'detailed' | 'simplified'>(
    'simplified'
  )

  if (!transaction.tokenTransfers || transaction.tokenTransfers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No token transfers found
          </p>
        </CardContent>
      </Card>
    )
  }

  const swapPairs = getSwapPairsFromTokenTransfers(transaction)
  const feeTransfers = getTokenFeeTransfers(transaction)

  return (
    <div className="space-y-4">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Coins size={20} />
          <h3 className="text-lg font-semibold">
            Token Transfers ({transaction.tokenTransfers.length})
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('simplified')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'simplified'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted-foreground/10'
            }`}
          >
            Simplified
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'detailed'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted-foreground/10'
            }`}
          >
            Detailed
          </button>
        </div>
      </div>

      {/* Token Transfers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowDownUp size={16} />
            {viewMode === 'simplified' ? 'Swap Summary' : 'All Transfers'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {viewMode === 'detailed' ? (
              // Detailed view: show all token transfers
              transaction.tokenTransfers.map((tt, i) => (
                <TransferLine
                  key={i}
                  from={tt.fromUserAccount}
                  to={tt.toUserAccount}
                  mint={tt.mint || tt.tokenMint}
                  amount={tt.tokenAmount}
                  timestamp={transaction.timestamp}
                  direction={
                    tt.fromUserAccount === transaction.feePayer
                      ? 'out'
                      : tt.toUserAccount === transaction.feePayer
                      ? 'in'
                      : undefined
                  }
                  className="bg-muted/30 rounded p-2"
                />
              ))
            ) : (
              // Simplified view: show swap pairs and fee payments
              <>
                {swapPairs.length > 0
                  ? swapPairs.map((swap, i) => (
                      <SwapLine
                        key={`swap-${i}`}
                        signer={swap.signer}
                        amountA={swap.amountA}
                        mintA={swap.mintA}
                        amountB={swap.amountB}
                        mintB={swap.mintB}
                        intermediary={swap.intermediary}
                        timestamp={transaction.timestamp}
                        className="bg-green-50 dark:bg-green-900/20 rounded p-3"
                      />
                    ))
                  : // Fallback to showing individual transfers if no swap pairs detected
                    transaction.tokenTransfers.map((tt, i) => (
                      <TransferLine
                        key={i}
                        from={tt.fromUserAccount}
                        to={tt.toUserAccount}
                        mint={tt.mint || tt.tokenMint}
                        amount={tt.tokenAmount}
                        timestamp={transaction.timestamp}
                        direction={
                          tt.fromUserAccount === transaction.feePayer
                            ? 'out'
                            : tt.toUserAccount === transaction.feePayer
                            ? 'in'
                            : undefined
                        }
                        className="bg-muted/30 rounded p-2"
                      />
                    ))}

                {/* Show fee transfers separately */}
                {feeTransfers.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2 text-muted-foreground">
                      Fee Payments
                    </p>
                    {feeTransfers.map((tt, i) => (
                      <TransferLine
                        key={`fee-${i}`}
                        from={tt.fromUserAccount}
                        to={tt.toUserAccount}
                        mint={tt.mint || tt.tokenMint}
                        amount={tt.tokenAmount}
                        timestamp={transaction.timestamp}
                        direction="fee"
                        className="bg-orange-50 dark:bg-orange-900/20 rounded p-2"
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Summary stats */}
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Transfers</p>
              <p className="text-sm font-medium">
                {transaction.tokenTransfers.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unique Tokens</p>
              <p className="text-sm font-medium">
                {
                  new Set(
                    transaction.tokenTransfers.map(
                      (tt) => tt.mint || tt.tokenMint
                    )
                  ).size
                }
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Accounts Involved</p>
              <p className="text-sm font-medium">
                {
                  new Set([
                    ...transaction.tokenTransfers.map(
                      (tt) => tt.fromUserAccount
                    ),
                    ...transaction.tokenTransfers.map((tt) => tt.toUserAccount),
                  ]).size
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
