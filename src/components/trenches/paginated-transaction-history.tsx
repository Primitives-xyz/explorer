'use client'

import { Button, ButtonSize, ButtonVariant } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Transaction,
  useTapestryTransactionHistory,
} from '@/hooks/use-tapestry-transaction-history'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useIsMobile } from '@/utils/use-is-mobile'
import {
  abbreviateWalletAddress,
  formatLargeNumber,
  formatUsdValue,
} from '@/utils/utils'
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Package,
  RefreshCw,
} from 'lucide-react'

interface PaginatedTransactionHistoryProps {
  limit?: number
  showLoadMore?: boolean
  className?: string
  currency?: 'SOL' | 'USD'
  solPrice?: number | null
  since?: number // Unix timestamp to start from
  until?: number // Unix timestamp to end at
}

export function PaginatedTransactionHistory({
  limit = 100,
  showLoadMore = true,
  className = '',
  currency = 'USD',
  solPrice,
  since,
  until,
}: PaginatedTransactionHistoryProps) {
  const { walletAddress } = useCurrentWallet()
  const { isMobile } = useIsMobile()

  const {
    transactions,
    meta,
    isLoading,
    isError,
    refetch,
    loadMore,
    loadNewer,
    hasMore,
  } = useTapestryTransactionHistory(walletAddress || '', {
    enabled: !!walletAddress,
    since,
    until,
    limit,
    sortOrder: 'desc',
  })

  const formatValue = (usdValue: number | undefined) => {
    if (!usdValue) return '--'
    if (currency === 'SOL' && solPrice && solPrice > 0) {
      return `${(usdValue / solPrice).toFixed(6)} SOL`
    }
    return formatUsdValue(usdValue)
  }

  const getTradeTypeDisplay = (transaction: Transaction) => {
    const { tradeType, inputMint, outputMint } = transaction
    const SOL_MINT = 'So11111111111111111111111111111111111111112'

    if (
      tradeType === 'buy' ||
      (inputMint === SOL_MINT && outputMint !== SOL_MINT)
    ) {
      return {
        type: 'BUY',
        color: 'text-green-400',
        bgColor: 'bg-green-400/10',
      }
    } else if (
      tradeType === 'sell' ||
      (outputMint === SOL_MINT && inputMint !== SOL_MINT)
    ) {
      return { type: 'SELL', color: 'text-red-400', bgColor: 'bg-red-400/10' }
    } else {
      return { type: 'SWAP', color: 'text-blue-400', bgColor: 'bg-blue-400/10' }
    }
  }

  if (!walletAddress) {
    return (
      <div
        className={`bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10 ${className}`}
      >
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Package className="w-12 h-12 text-gray-600 mb-3" />
          <p className="text-gray-400 mb-2">Connect your wallet</p>
          <p className="text-sm text-gray-500">View your transaction history</p>
        </div>
      </div>
    )
  }

  if (isLoading && !transactions) {
    return (
      <div
        className={`bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10 ${className}`}
      >
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
          <p className="text-gray-400">Loading transactions...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div
        className={`bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10 ${className}`}
      >
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Package className="w-12 h-12 text-red-500/50 mb-3" />
          <p className="text-red-400 mb-2">Error loading transactions</p>
          <p className="text-sm text-gray-500 mb-4">Please try again later</p>
          <Button
            variant={ButtonVariant.OUTLINE}
            onClick={refetch}
            className="text-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-black/20 backdrop-blur-sm rounded-lg border border-white/10 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Transaction History</h3>
        </div>
        <div className="flex items-center gap-3">
          {meta && (
            <div className="text-sm text-gray-400">
              {meta.total} total transactions
            </div>
          )}
          <Button
            variant={ButtonVariant.GHOST}
            size={ButtonSize.ICON_SM}
            onClick={refetch}
            disabled={isLoading}
            className="flex-shrink-0"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        {/* Load Newer Button */}
        {meta?.newestTimestamp && (
          <div className="flex justify-center">
            <Button
              variant={ButtonVariant.OUTLINE}
              size={ButtonSize.SM}
              onClick={loadNewer}
              disabled={isLoading}
              className="text-xs"
            >
              <ChevronUp className="w-3 h-3 mr-1" />
              Load newer transactions
            </Button>
          </div>
        )}

        {!transactions || transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="w-12 h-12 text-gray-600 mb-3" />
            <p className="text-gray-400 mb-2">No transactions found</p>
            <p className="text-sm text-gray-500">
              Your trades will appear here after you make some transactions
            </p>
          </div>
        ) : (
          transactions.map((transaction, index) => {
            const tradeDisplay = getTradeTypeDisplay(transaction)
            const timestamp = transaction.timestamp
              ? new Date(transaction.timestamp * 1000).toLocaleDateString()
              : transaction.createdAt
              ? new Date(transaction.createdAt).toLocaleDateString()
              : 'Unknown'

            return (
              <Card
                key={transaction.transactionSignature || index}
                className="bg-white/5 border-white/10"
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Trade Type Badge */}
                      <div
                        className={`px-2 py-1 rounded-md text-xs font-medium ${tradeDisplay.bgColor} ${tradeDisplay.color} flex-shrink-0`}
                      >
                        {tradeDisplay.type}
                      </div>

                      {/* Transaction Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">
                            {formatLargeNumber(transaction.inputAmount, 6)} →{' '}
                            {formatLargeNumber(transaction.outputAmount, 6)}
                          </span>
                          {transaction.platform && (
                            <span className="text-xs text-gray-400 px-1.5 py-0.5 bg-white/5 rounded">
                              {transaction.platform}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {abbreviateWalletAddress({
                            address: transaction.inputMint,
                            maxLength: 12,
                          })}{' '}
                          →{' '}
                          {abbreviateWalletAddress({
                            address: transaction.outputMint,
                            maxLength: 12,
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Values */}
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatValue(transaction.inputValueUSD)}
                        </div>
                        <div className="text-xs text-gray-400">{timestamp}</div>
                      </div>

                      {/* External Link */}
                      {transaction.transactionSignature && (
                        <Button
                          variant={ButtonVariant.GHOST}
                          size={ButtonSize.ICON_SM}
                          onClick={() =>
                            window.open(
                              `https://solscan.io/tx/${transaction.transactionSignature}`,
                              '_blank'
                            )
                          }
                          className="flex-shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}

        {/* Load More Button */}
        {showLoadMore && hasMore && (
          <div className="flex justify-center pt-2">
            <Button
              variant={ButtonVariant.OUTLINE}
              size={ButtonSize.SM}
              onClick={loadMore}
              disabled={isLoading}
              className="text-xs"
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 border border-gray-300 border-t-white rounded-full animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Load more transactions
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
