'use client'

import { useTransactionType } from '@/components-new-version/home/home-content/following-transactions/hooks/use-transaction-type'
import { SwapTransactionsView } from '@/components-new-version/home/home-content/following-transactions/swap-transactions/swap-transactions-view'
import { Transaction } from '@/components-new-version/models/helius.models'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { useMemo } from 'react'

interface Props {
  transaction: Transaction
}

export function TransactionsEntry({ transaction }: Props) {
  const { walletAddress } = useCurrentWallet()

  const {
    isComment,
    isSwap,
    isSolanaTransfer,
    isSPLTransfer,
    isNFTTransaction,
  } = useTransactionType(transaction)

  const primaryType = useMemo(() => {
    if (isComment) return 'COMMENT'
    if (isSwap) return 'SWAP'
    if (isSolanaTransfer) return 'SOL TRANSFER'
    if (isSPLTransfer) return 'SPL TRANSFER'
    if (isNFTTransaction) return 'NFT'
    return 'OTHER'
  }, [isComment, isSwap, isSolanaTransfer, isSPLTransfer, isNFTTransaction])

  return (
    <>
      <>
        {isSwap && (
          <SwapTransactionsView
            transaction={transaction}
            sourceWallet={transaction.sourceWallet || walletAddress || ''}
            primaryType={primaryType}
          />
        )}
      </>
    </>
  )
}
