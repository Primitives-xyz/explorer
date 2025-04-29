'use client'

import { MotionCard } from '@/components/motion/components/motion-card'
import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { TokenInfo } from '@/components/tapestry/models/token.models'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { SwapTransactionsViewDetails } from '@/components/transactions/swap-transactions/swap-transactions-view-details'
import { Badge, CardContent, CardHeader } from '@/components/ui'
import { getSourceIcon } from '@/utils/transactions'
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
  transaction: IHomeTransaction
  sourceWallet: string
}

export function SwapTransactionsView({ transaction, sourceWallet }: Props) {
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

  return (
    <MotionCard className="overflow-visible">
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
            })
          }}
        >
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="rounded-md">
              Swap
            </Badge>
            {transaction.source && (
              <>
                <p>on</p>
                <Badge className="rounded-md" variant="outline">
                  {getSourceIcon(transaction.source)}
                  <span>{transaction.source}</span>
                </Badge>
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
    </MotionCard>
  )
}
