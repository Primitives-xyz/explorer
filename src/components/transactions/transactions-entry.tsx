'use client'

import {
  TransactionType,
  useTransactionType,
} from '@/components/home/home-content/following-transactions/hooks/use-transaction-type'
import { Transaction } from '@/components/tapestry/models/helius.models'
import { NftTransactionsView } from '@/components/transactions/nft-transactions-view'
import { OtherTransactions } from '@/components/transactions/other-transactions'
import { SolTransferTransactions } from '@/components/transactions/sol-transfer-transactions'
import { SwapTransactionsView } from '@/components/transactions/swap-transactions/swap-transactions-view'

interface Props {
  transaction: Transaction
  walletAddress?: string
  displaySwap?: boolean
  displayNft?: boolean
  displaySolTransfer?: boolean
  displayOther?: boolean
}

export function TransactionsEntry({
  transaction,
  walletAddress,
  displaySwap,
  displayNft,
  displaySolTransfer,
  displayOther,
}: Props) {
  const primaryType = useTransactionType(transaction)

  return (
    <>
      {primaryType === TransactionType.SWAP && displaySwap && (
        <SwapTransactionsView
          transaction={transaction}
          sourceWallet={transaction.sourceWallet || walletAddress || ''}
        />
      )}

      {primaryType === TransactionType.NFT && displayNft && (
        <NftTransactionsView
          transaction={transaction}
          sourceWallet={transaction.sourceWallet || walletAddress || ''}
          primaryType={primaryType}
        />
      )}

      {primaryType === TransactionType.SOL_TRANSFER && displaySolTransfer && (
        <SolTransferTransactions
          transaction={transaction}
          sourceWallet={transaction.sourceWallet || walletAddress || ''}
        />
      )}

      {primaryType === TransactionType.OTHER && displayOther && (
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
