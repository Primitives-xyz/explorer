'use client'

import { TokenLine } from '@/components/transactions/common/token-line'

interface Props {
  token: import('./swap-transactions-view').TokenDisplay
  tokenLoading: boolean
  tokenPrice: number | null
  priceLoading: boolean
  isReceived?: boolean
  usdValue?: number | null
}

export function SwapTransactionsViewDetails({
  token,
  tokenLoading,
  tokenPrice,
  priceLoading,
  isReceived,
  usdValue,
}: Props) {
  return (
    <div className="flex bg-card-accent rounded-lg px-4 gap-4 items-center justify-between h-12 md:ml-12">
      <TokenLine
        mint={token.mint}
        amount={token.amount}
        type={isReceived ? 'received' : 'sent'}
        showUsd={true}
        usdValue={usdValue}
      />
    </div>
  )
}
