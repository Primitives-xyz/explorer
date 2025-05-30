'use client'

import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import { Transaction } from '@/components/tapestry/models/helius.models'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TransactionContent, isCopiedSwap, isDirectSwap } from '@/types/content'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Activity, Fuel, Layers, TrendingDown, TrendingUp } from 'lucide-react'
import { TokenLine } from '../common/token-line'
import { processSwapTransaction } from '../swap-transaction/swap-transaction-utils'

interface TransactionOverviewProps {
  transaction: Transaction
  content: TransactionContent | null
}

export function TransactionOverview({
  transaction,
  content,
}: TransactionOverviewProps) {
  const processedTx =
    transaction.type === 'SWAP' ? processSwapTransaction(transaction) : null
  const isSwapContent =
    content && (isDirectSwap(content) || isCopiedSwap(content))

  return (
    <div className="space-y-4">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Signature</p>
              <SolanaAddressDisplay
                address={transaction.signature}
                highlightable={true}
                showCopyButton={true}
                displayAbbreviatedAddress={true}
                className="text-sm font-mono"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Block</p>
              <p className="text-sm font-medium">
                {transaction.slot.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Timestamp</p>
              <p className="text-sm font-medium">
                {new Date(transaction.timestamp * 1000).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Type</p>
              <Badge variant="outline">{transaction.type}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Fuel size={16} />
            Fee Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Transaction Fee
              </p>
              <p className="text-sm font-medium">
                {(transaction.fee / LAMPORTS_PER_SOL).toFixed(9)} SOL
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Fee Payer</p>
              <SolanaAddressDisplay
                address={transaction.feePayer}
                highlightable={true}
                showCopyButton={true}
                displayAbbreviatedAddress={true}
                className="text-sm"
              />
            </div>
            {isSwapContent &&
              'usdcFeeAmount' in content &&
              content.usdcFeeAmount && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">USDC Fee</p>
                  <p className="text-sm font-medium">
                    ${content.usdcFeeAmount}
                  </p>
                </div>
              )}
            {isSwapContent && content.priorityLevel && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Priority Level
                </p>
                <Badge variant="secondary">{content.priorityLevel}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Swap Details (if applicable) */}
      {transaction.type === 'SWAP' && processedTx && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity size={16} />
              Swap Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {processedTx.primaryOutgoingToken && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-2">You Sent</p>
                  <TokenLine
                    mint={processedTx.primaryOutgoingToken.mint}
                    amount={processedTx.primaryOutgoingToken.amount}
                    type="sent"
                    showUsd={true}
                  />
                </div>
              )}
              {processedTx.primaryIncomingToken && (
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    You Received
                  </p>
                  <TokenLine
                    mint={processedTx.primaryIncomingToken.mint}
                    amount={processedTx.primaryIncomingToken.amount}
                    type="received"
                    showUsd={true}
                  />
                </div>
              )}
            </div>

            {/* Additional swap metrics from content */}
            {isSwapContent && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Price Impact
                  </p>
                  <div className="flex items-center gap-1">
                    {Number(content.priceImpact) > 0 ? (
                      <TrendingDown className="text-red-500" size={14} />
                    ) : (
                      <TrendingUp className="text-green-500" size={14} />
                    )}
                    <p className="text-sm font-medium">
                      {content.priceImpact}%
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Slippage</p>
                  <p className="text-sm font-medium">
                    {(Number(content.slippageBps) / 100).toFixed(2)}%
                  </p>
                </div>
                {content.route && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Route</p>
                    <Badge variant="outline">{content.route}</Badge>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Account Changes */}
      {transaction.accountData && transaction.accountData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers size={16} />
              Account Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transaction.accountData.slice(0, 5).map((account, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <SolanaAddressDisplay
                    address={account.account}
                    highlightable={true}
                    showCopyButton={true}
                    displayAbbreviatedAddress={true}
                    className="text-sm"
                  />
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-xs">
                      {account.nativeBalanceChange !== 0
                        ? `${account.nativeBalanceChange > 0 ? '+' : ''}${(
                            account.nativeBalanceChange / LAMPORTS_PER_SOL
                          ).toFixed(9)} SOL`
                        : 'No SOL change'}
                    </Badge>
                  </div>
                </div>
              ))}
              {transaction.accountData.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  And {transaction.accountData.length - 5} more accounts...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
