'use client'

import {
  TransactionType,
  useTransactionType,
} from '@/components-new-version/home/home-content/following-transactions/hooks/use-transaction-type'
import { NftTransactionsView } from '@/components-new-version/home/home-content/following-transactions/nft-transactions.tsx/nft-transactions-view'
import { SwapTransactionsView } from '@/components-new-version/home/home-content/following-transactions/swap-transactions/swap-transactions-view'
import { Transaction } from '@/components-new-version/models/helius.models'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'

interface Props {
  transaction: Transaction
}

export function TransactionsEntry({ transaction }: Props) {
  const { walletAddress } = useCurrentWallet()
  const primaryType = useTransactionType(transaction)

  return (
    <>
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

        {/* {primaryType === TransactionType.COMMENT && <p>is comment</p>} */}

        {/* {isSolanaTransfer && <p>solana transfer</p>}

        {isSPLTransfer && <p>spl transfer</p>}

        {!isComment && !isSolanaTransfer && !isSPLTransfer && (
          <p>transfer list</p>
        )} */}
      </>
    </>
  )
}
