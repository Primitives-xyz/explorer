'use client'

import { IHomeTransaction } from '../home-transactions.models'
import { StakeTransactionsView } from './stake-transactions-view'
import { SwapTransactionsView } from './swap-transactions-view'

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
}

export function HomeTransactionEntry({ transaction }: Props) {
  // Check if this is a stake transaction
  if (transaction.content?.type === 'stake') {
    return (
      <StakeTransactionsView
        transaction={transaction}
        sourceWallet={transaction.sourceWallet || ''}
      />
    )
  }

  // Default to swap transaction view
  return (
    <SwapTransactionsView
      transaction={transaction}
      sourceWallet={transaction.sourceWallet || ''}
    />
  )
}
