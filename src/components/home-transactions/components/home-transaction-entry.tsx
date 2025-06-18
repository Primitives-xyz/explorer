'use client'

import { IHomeTransaction } from '../home-transactions.models'
import { FollowTransactionsView } from './follow-transactions-view'
import { PudgyClaimTransactionsView } from './pudgy-claim-transactions-view'
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
  // Check if this is a follow transaction
  if (transaction.content?.type === 'follow') {
    return (
      <FollowTransactionsView
        transaction={transaction}
        sourceWallet={transaction.sourceWallet || ''}
      />
    )
  }
  
  // Check if this is a pudgy profile claim transaction
  if (transaction.content?.type === 'pudgy_profile_claim') {
    return (
      <PudgyClaimTransactionsView
        transaction={transaction}
        sourceWallet={transaction.sourceWallet || ''}
      />
    )
  }

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
