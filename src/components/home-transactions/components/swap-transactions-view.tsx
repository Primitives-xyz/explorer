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
  const fromTokenMint =
    transaction.content?.inputMint || processedTx.primaryOutgoingToken?.mint
  const toTokenMint =
    transaction.content?.outputMint || processedTx.primaryIncomingToken?.mint

  // Get amount from content if available (content stores human-readable amounts)
  const fromAmount = transaction.content?.inputAmount
    ? Number(transaction.content.inputAmount)
    : processedTx.primaryOutgoingToken?.amount || 0

  const toAmount = transaction.content?.expectedOutput
    ? Number(transaction.content.expectedOutput)
    : processedTx.primaryIncomingToken?.amount || 0

  // Get USD values from content
  const fromAmountUsd = transaction.content?.inputAmountUsd
    ? Number(transaction.content.inputAmountUsd)
    : null
  const toAmountUsd = transaction.content?.outputAmountUsd
    ? Number(transaction.content.outputAmountUsd)
    : null

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fromToken = fromTokenMint
    ? {
        mint: fromTokenMint,
        amount: fromAmount,
        symbol: processedTx.primaryOutgoingToken?.symbol || '',
      }
    : processedTx.primaryOutgoingToken

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const toToken = toTokenMint
    ? {
        mint: toTokenMint,
        amount: toAmount,
        symbol: processedTx.primaryIncomingToken?.symbol || '',
      }
    : processedTx.primaryIncomingToken

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
              <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2.5 py-1 rounded-full text-[10px] font-black shadow-lg animate-pulse">
                ⚡ LOW FEE
              </div>
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
          usdValue={fromAmountUsd}
        />
        <SwapTransactionsViewDetails
          token={{ ...toToken, ...toTokenInfo }}
          isReceived
          usdValue={toAmountUsd}
        />

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
