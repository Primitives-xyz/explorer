'use client'

import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { Badge, Card, CardContent, CardHeader } from '@/components/ui'
import { SSE_TOKEN_MINT } from '@/utils/constants'
import { formatNumber } from '@/utils/utils'
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { IHomeTransaction } from '../home-transactions.models'
import { ContentActions } from './content-actions'
import { TransactionsHeader } from './transactions-header'

interface Props {
  transaction: IHomeTransaction & {
    content?: {
      type?: string
      transactionType?: string
      stakeAmount?: string
      usdcFeeAmount?: string
      action?: string
      ssePrice?: string
      tokenMint?: string
      tokenSymbol?: string
    }
  }
  sourceWallet: string
}

export function StakeTransactionsView({ transaction, sourceWallet }: Props) {
  const t = useTranslations()
  const { data: tokenInfo } = useTokenInfo(SSE_TOKEN_MINT)

  // Extract stake data from content properties
  const isStake = transaction.content?.action === 'stake'
  const stakeAmount = transaction.content?.stakeAmount || '0'
  const usdcValue = transaction.content?.usdcFeeAmount || '0'
  const ssePrice = transaction.content?.ssePrice || '0'

  const tokenImage = tokenInfo?.result?.content?.links?.image
  const tokenSymbol = transaction.content?.tokenSymbol || 'SSE'
  const tokenName = tokenInfo?.result?.content?.metadata?.name || 'SSE'

  return (
    <Card className="overflow-visible">
      <CardHeader>
        <TransactionsHeader
          transaction={transaction}
          sourceWallet={sourceWallet}
          onClickTradeButton={() => {
            // Navigate to stake page
            window.location.href = '/stake'
          }}
          tradeButtonText="Stake SSE"
        >
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="rounded-md">
              {isStake ? t('common.stake') : t('common.unstake')}
            </Badge>
          </div>
        </TransactionsHeader>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="relative">
              {tokenImage && (
                <Image
                  src={tokenImage}
                  alt={tokenName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div
                className={`absolute -bottom-1 -right-1 p-1 rounded-full ${
                  isStake ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {isStake ? (
                  <ArrowUpIcon className="w-3 h-3 text-white" />
                ) : (
                  <ArrowDownIcon className="w-3 h-3 text-white" />
                )}
              </div>
            </div>
            <div>
              <p className="font-medium">
                {formatNumber(stakeAmount)} {tokenSymbol}
              </p>
              <p className="text-sm text-muted-foreground">{tokenName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">
              ${formatNumber(Math.abs(Number(usdcValue)))}
            </p>
            <p className="text-sm text-muted-foreground">
              @ ${formatNumber(Number(ssePrice))}
            </p>
          </div>
        </div>

        {/* Staking details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">{t('common.action')}</p>
            <p className="font-medium">
              {isStake ? t('common.staked') : t('common.unstaked')}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('common.value')}</p>
            <p className="font-medium">
              ${formatNumber(Math.abs(Number(usdcValue)))}
            </p>
          </div>
        </div>

        {/* Actions: likes + comments */}
        {transaction.signature && (
          <div className="w-full">
            <ContentActions
              contentId={transaction.signature}
              initialLikeCount={0}
              initialHasLiked={false}
              initialCommentCount={0}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
