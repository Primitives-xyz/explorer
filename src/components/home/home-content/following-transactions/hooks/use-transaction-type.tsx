import type { Transaction } from '@/utils/helius/types'
import { useMemo } from 'react'

const COMMISSION_WALLET = '8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz'

export enum TransactionType {
  COMMENT = 'COMMENT',
  SWAP = 'SWAP',
  SOL_TRANSFER = 'SOL TRANSFER',
  SPL_TRANSFER = 'SPL TRANSFER',
  NFT = 'NFT',
  OTHER = 'OTHER',
}

export function useTransactionType(transaction: Transaction): TransactionType {
  return useMemo(() => {
    const conditions = [
      {
        check:
          transaction.tokenTransfers?.length === 2 &&
          transaction.tokenTransfers.some(
            (t) => t.to === COMMISSION_WALLET && t.amount === 20
          ) &&
          transaction.tokenTransfers.some(
            (t) => t.to !== COMMISSION_WALLET && t.amount === 80
          ),
        type: TransactionType.COMMENT,
      },
      { check: transaction.type === 'SWAP', type: TransactionType.SWAP },
      {
        check:
          transaction.source === 'SYSTEM_PROGRAM' &&
          transaction.type === 'TRANSFER',
        type: TransactionType.SOL_TRANSFER,
      },
      {
        check:
          (transaction.source === 'SOLANA_PROGRAM_LIBRARY' ||
            transaction.source === 'PHANTOM') &&
          transaction.type === 'TRANSFER',
        type: TransactionType.SPL_TRANSFER,
      },
      {
        check:
          transaction.source === 'MAGIC_EDEN' ||
          transaction.source === 'TENSOR' ||
          transaction.type === 'COMPRESSED_NFT_MINT',
        type: TransactionType.NFT,
      },
    ]

    return conditions.find((c) => c.check)?.type || TransactionType.OTHER
  }, [transaction])
}
