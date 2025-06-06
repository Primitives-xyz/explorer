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
import { useEffect, useState } from 'react'
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
  const [likeCount, setLikeCount] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)

  const processedTx = processSwapTransaction(transaction)
  const fromToken = processedTx.primaryOutgoingToken
  const toToken = processedTx.primaryIncomingToken

  // Fetch content information for likes
  const {
    content,
    loading: contentLoading,
    hasLiked: initialHasLiked,
    likeCount: initialLikeCount,
    refetch: refetchContent,
  } = useTransactionContent({
    signature: transaction.signature,
    enabled: !!transaction.signature,
  })

  const { data: fromTokenInfo, loading: fromTokenLoading } = useTokenInfo(
    fromToken?.mint
  )
  const { data: toTokenInfo, loading: toTokenLoading } = useTokenInfo(
    toToken?.mint
  )

  // Update local state when content data changes
  useEffect(() => {
    if (content) {
      setLikeCount(initialLikeCount)
      setHasLiked(initialHasLiked)
    }
  }, [content, initialLikeCount, initialHasLiked])

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

  const handleLikeChange = (newHasLiked: boolean, newCount: number) => {
    setHasLiked(newHasLiked)
    setLikeCount(newCount)
    // Optionally refetch content to sync with server
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
