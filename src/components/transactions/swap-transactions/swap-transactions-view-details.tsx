'use client'

import { TokenLine } from '@/components/transactions/common/token-line'
import { SOL_MINT } from '@/utils/constants'
import { route } from '@/utils/route'
import { abbreviateWalletAddress, formatNumber } from '@/utils/utils'
import Image from 'next/image'
import Link from 'next/link'

interface Props {
  token: import('./swap-transactions-view').TokenDisplay
  tokenLoading: boolean
  tokenPrice: number | null
  priceLoading: boolean
  isReceived?: boolean
}

export function SwapTransactionsViewDetails({
  token,
  tokenLoading,
  tokenPrice,
  priceLoading,
  isReceived,
}: Props) {
  return (
    <div className="flex bg-card-accent rounded-lg px-4 gap-4 items-center justify-between h-12 ml-12">
      <TokenLine
        mint={token.mint}
        amount={token.amount}
        type={isReceived ? 'received' : 'sent'}
        showUsd={true}
      />
    </div>
  )
}
