'use client'

import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { TokenInfo } from '@/components/tapestry/models/token.models'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { SwapTransactionsViewDetails } from '@/components/transactions/swap-transactions/swap-transactions-view-details'
import { Badge, Card, CardContent, CardHeader } from '@/components/ui'
import { getSourceIcon } from '@/utils/transactions'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { abbreviateWalletAddress } from '@/utils/utils'
import { Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { IHomeTransaction } from '../home-transactions.models'
import { useTransactionContent } from '../hooks/use-transaction-content'
import { processSwapTransaction } from '../utils/swap-transaction.utils'
import { LikesButton } from './likes-button'
import { TransactionsHeader } from './transactions-header'

export type TokenDisplay = {
  mint: string
  amount: number
  tokenInfo?: TokenInfo
  loading?: boolean
  error?: string
}

interface Props {
  transaction: IHomeTransaction & {
    content?: any
  }
  sourceWallet: string
}

export function SwapTransactionsView({ transaction, sourceWallet }: Props) {
  const t = useTranslations()
  const { setOpen, setInputs } = useSwapStore()
  const { mainProfile } = useCurrentWallet()

  const processedTx = processSwapTransaction(transaction)
  
  // Prefer content data when available for accuracy
  const fromTokenMint = transaction.content?.inputMint || processedTx.primaryOutgoingToken?.mint
  const toTokenMint = transaction.content?.outputMint || processedTx.primaryIncomingToken?.mint
  
  // Get amount from content if available, otherwise from processed transaction
  const fromAmount = transaction.content?.inputAmount 
    ? Number(transaction.content.inputAmount) / Math.pow(10, transaction.content?.inputTokenDecimals || 6)
    : processedTx.primaryOutgoingToken?.amount || 0
    
  const toAmount = transaction.content?.expectedOutput 
    ? Number(transaction.content.expectedOutput) / Math.pow(10, transaction.content?.outputTokenDecimals || 6)
    : processedTx.primaryIncomingToken?.amount || 0
  
  const fromToken = fromTokenMint ? {
    mint: fromTokenMint,
    amount: fromAmount,
    symbol: processedTx.primaryOutgoingToken?.symbol || ''
  } : processedTx.primaryOutgoingToken
  
  const toToken = toTokenMint ? {
    mint: toTokenMint,
    amount: toAmount,
    symbol: processedTx.primaryIncomingToken?.symbol || ''
  } : processedTx.primaryIncomingToken
  
  const sseFeeTransfer = processedTx.sseFeeTransfer

  // Check if we have SSE fee information from content
  const sseFeeAmount = transaction.content?.sseFeeAmount
  const hasSSEFee = sseFeeTransfer || (sseFeeAmount && Number(sseFeeAmount) > 0)
  const displaySSEFeeAmount = sseFeeAmount 
    ? Number(sseFeeAmount) / Math.pow(10, 6) // Convert from base units
    : sseFeeTransfer?.amount || 0

  // Fetch content information for likes
  const {
    content,
    loading: contentLoading,
    refetch: refetchContent,
  } = useTransactionContent({
    signature: transaction.signature,
    enabled: !!transaction.signature,
  })

  // Get like data from content
  const hasLiked = content?.requestingProfileSocialInfo?.hasLiked || false
  const likeCount = content?.socialCounts?.likeCount || 0

  const { data: fromTokenInfo, loading: fromTokenLoading } = useTokenInfo(
    fromToken?.mint
  )
  const { data: toTokenInfo, loading: toTokenLoading } = useTokenInfo(
    toToken?.mint
  )

  // Create content if it doesn't exist and we have the necessary data
  useEffect(() => {
    const createContentIfNeeded = async () => {
      if (
        !content &&
        !contentLoading &&
        transaction.signature &&
        mainProfile?.username &&
        fromToken &&
        toToken
      ) {
        try {
          // Create content for this transaction
          await fetch('/api/content', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: transaction.signature,
              profileId: transaction.profile?.username || sourceWallet,
              properties: [
                { key: 'type', value: 'swap' },
                { key: 'txSignature', value: transaction.signature },
                { key: 'timestamp', value: String(Date.now()) },
                { key: 'inputMint', value: fromToken.mint },
                { key: 'outputMint', value: toToken.mint },
                { key: 'inputAmount', value: String(fromToken.amount) },
                { key: 'sourceWallet', value: sourceWallet },
                { key: 'transactionType', value: 'direct' },
              ],
            }),
          })
          // Refetch content after creation
          refetchContent()
        } catch (error) {
          console.error('Error creating content:', error)
        }
      }
    }

    createContentIfNeeded()
  }, [
    content,
    contentLoading,
    transaction.signature,
    mainProfile?.username,
    fromToken,
    toToken,
    sourceWallet,
    transaction.profile?.username,
    refetchContent,
  ])

  const handleLikeChange = () => {
    // Refresh content data from server after like/unlike
    refetchContent()
  }

  if (!fromToken || !toToken) return null

  const fromTokenPrice =
    fromTokenInfo?.result && 'token_info' in fromTokenInfo.result
      ? fromTokenInfo.result.token_info?.price_info?.price_per_token
      : null
  const toTokenPrice =
    toTokenInfo?.result && 'token_info' in toTokenInfo.result
      ? toTokenInfo.result.token_info?.price_info?.price_per_token
      : null

  // Check if this is a copy trade
  const isCopyTrade = transaction.content?.transactionType === 'copied'
  const copySourceWallet = transaction.content?.sourceWallet
  const copySourceTransactionId = transaction.content?.sourceTransactionId
  const copySourceUsername = transaction.content?.sourceWalletUsername
  const copySourceImage = transaction.content?.sourceWalletImage

  return (
    <Card className="overflow-visible">
      <CardHeader>
        <TransactionsHeader
          transaction={transaction}
          sourceWallet={sourceWallet}
          onClickTradeButton={() => {
            setOpen(true)
            setInputs({
              inputMint: fromToken.mint,
              outputMint: toToken.mint,
              inputAmount: fromToken.amount,
              // For copy trades, pass the original source wallet and transaction
              // For non-copy trades, use the transaction's feePayer (who executed the trade)
              sourceWallet: isCopyTrade
                ? copySourceWallet
                : processedTx.feePayer,
              sourceTransactionId: isCopyTrade
                ? copySourceTransactionId
                : transaction.signature,
            })
          }}
        >
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="rounded-md">
              {t('common.swap')}
            </Badge>
            {transaction.source && (
              <>
                <p className="text-muted-foreground">{t('common.on')}</p>
                <Badge className="rounded-md" variant="outline">
                  {getSourceIcon(transaction.source)}
                  <span>{transaction.source}</span>
                </Badge>
              </>
            )}
            {hasSSEFee && (
              <Badge 
                className="rounded-md bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
                variant="outline"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t('swap.low_fee_sse')}
              </Badge>
            )}
            {isCopyTrade && (copySourceUsername || copySourceWallet) && (
              <>
                <p className="text-muted-foreground">•</p>
                <div className="flex items-center gap-1">
                  <Copy size={10} className="text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t('common.copied')} {t('copy_trading.from')}
                  </span>
                  <span className="font-medium">
                    {copySourceUsername
                      ? `@${copySourceUsername}`
                      : abbreviateWalletAddress({
                          address: copySourceWallet,
                          desiredLength: 8,
                        })}
                  </span>
                </div>
              </>
            )}
          </div>
        </TransactionsHeader>
      </CardHeader>

      <CardContent className="space-y-4">
        <SwapTransactionsViewDetails
          token={{ ...fromToken, ...fromTokenInfo }}
          tokenLoading={fromTokenLoading}
          tokenPrice={fromTokenPrice ?? null}
          priceLoading={fromTokenLoading}
        />
        <SwapTransactionsViewDetails
          token={{ ...toToken, ...toTokenInfo }}
          tokenLoading={toTokenLoading}
          tokenPrice={toTokenPrice ?? null}
          priceLoading={toTokenLoading}
          isReceived
        />

        {/* SSE Fee Display */}
        {hasSSEFee && (
          <div className="px-4 py-3 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-lg border border-purple-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                    {t('swap.fee_paid_with_sse')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t('swap.lowest_fees_available')}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  {displaySSEFeeAmount.toFixed(2)} SSE
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('swap.platform_fee')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Likes section in bottom right */}
        <div className="flex justify-end">
          {transaction.signature && (
            <LikesButton
              contentId={transaction.signature}
              initialLikeCount={likeCount}
              initialHasLiked={hasLiked}
              onLikeChange={handleLikeChange}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
