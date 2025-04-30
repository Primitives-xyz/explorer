'use client'

import { IHomeTransaction } from '../home-transactions.models'
import { SwapTransactionsView } from './swap-transactions-view'

interface Props {
  transaction: IHomeTransaction
  walletAddress?: string
}

export function HomeTransactionEntry({ transaction, walletAddress }: Props) {
  return (
    <SwapTransactionsView
      transaction={transaction}
      sourceWallet={transaction.sourceWallet || walletAddress || ''}
    />
  )
}
