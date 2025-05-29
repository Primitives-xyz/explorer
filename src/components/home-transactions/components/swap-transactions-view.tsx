'use client'

import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { TokenInfo } from '@/components/tapestry/models/token.models'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { SwapTransactionsViewDetails } from '@/components/transactions/swap-transactions/swap-transactions-view-details'
import { Badge, Card, CardContent, CardHeader } from '@/components/ui'
import { getSourceIcon } from '@/utils/transactions'
import { abbreviateWalletAddress } from '@/utils/utils'
import { Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { IHomeTransaction } from '../home-transactions.models'
import { processSwapTransaction } from '../utils/swap-transaction.utils'
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

  const processedTx = processSwapTransaction(transaction)
  const fromToken = processedTx.primaryOutgoingToken
  const toToken = processedTx.primaryIncomingToken

  const { data: fromTokenInfo, loading: fromTokenLoading } = useTokenInfo(
    fromToken?.mint
  )
  const { data: toTokenInfo, loading: toTokenLoading } = useTokenInfo(
    toToken?.mint
  )

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
              sourceWallet: isCopyTrade ? copySourceWallet : sourceWallet,
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
      </CardContent>
    </Card>
  )
}
