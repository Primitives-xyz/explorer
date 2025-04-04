'use client'

import {
  TransactionType,
  useTransactionType,
} from '@/components-new-version/home/home-content/following-transactions/hooks/use-transaction-type'
import { Transaction } from '@/components-new-version/models/helius.models'
import { NftTransactionsView } from '@/components-new-version/transactions/nft-transactions.tsx/nft-transactions-view'
import { OtherTransactions } from '@/components-new-version/transactions/other-transactions'
import { SolTransferTransactions } from '@/components-new-version/transactions/sol-transfer-transactions'
import { SwapTransactionsView } from '@/components-new-version/transactions/swap-transactions/swap-transactions-view'

interface Props {
  transaction: Transaction
  walletAddress?: string
}

export function TransactionsEntry({ transaction, walletAddress }: Props) {
  const primaryType = useTransactionType(transaction)

  return (
    <>
      {primaryType === TransactionType.SWAP && (
        <SwapTransactionsView
          transaction={transaction}
          sourceWallet={transaction.sourceWallet || walletAddress || ''}
        />
      )}

      {primaryType === TransactionType.NFT && (
        <NftTransactionsView
          transaction={transaction}
          sourceWallet={transaction.sourceWallet || walletAddress || ''}
          primaryType={primaryType}
        />
      )}

      {primaryType === TransactionType.SOL_TRANSFER && (
        <SolTransferTransactions
          transaction={transaction}
          sourceWallet={transaction.sourceWallet || walletAddress || ''}
        />
      )}

      {primaryType === TransactionType.OTHER && (
        <OtherTransactions
          transaction={transaction}
          sourceWallet={transaction.sourceWallet || walletAddress || ''}
        />
      )}

      {/* {primaryType === TransactionType.SPL_TRANSFER && (
        <SplTransferTransactions
          transaction={transaction}
          sourceWallet={transaction.sourceWallet || walletAddress || ''}
        />
      )} */}
    </>
  )
}
