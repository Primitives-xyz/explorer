'use client'

import { IHomeTransaction } from '../home-transactions.models'
import { SwapTransactionsView } from './swap-transactions-view'

interface Props {
  transaction: IHomeTransaction
}

export function HomeTransactionEntry({ transaction }: Props) {
  return (
    <SwapTransactionsView
      transaction={transaction}
      sourceWallet={transaction.sourceWallet || ''}
    />
  )
}
