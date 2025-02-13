import type { Transaction } from '@/utils/helius/types'
import type { ExtendedTransaction } from '@/utils/nft-transaction'

// Shared type for transaction display props
export interface BaseTransactionDisplayProps {
  transaction: Transaction
  sourceWallet: string
}

// Shared transformation logic
export const transformToExtendedTransaction = (
  tx: Transaction
): ExtendedTransaction => ({
  ...tx,
  tokenTransfers:
    tx.tokenTransfers?.map((transfer) => ({
      fromTokenAccount: transfer.fromTokenAccount,
      toTokenAccount: transfer.toTokenAccount,
      fromUserAccount: transfer.fromUserAccount,
      toUserAccount: transfer.toUserAccount,
      tokenAmount: transfer.tokenAmount,
      mint: transfer.tokenMint,
      tokenStandard: transfer.tokenStandard,
    })) || [],
  transfers:
    tx.nativeTransfers?.map((transfer) => ({
      from: transfer.fromUserAccount,
      to: transfer.toUserAccount,
      amount: transfer.amount,
    })) || [],
})

// Shared view logic for determining which transaction view to show
export const shouldShowCustomView = (tx: Transaction) => ({
  showSwapView: tx.type === 'SWAP',
  showSolanaTransferView:
    tx.source === 'SYSTEM_PROGRAM' && tx.type === 'TRANSFER',
  showSPLTransferView:
    (tx.source === 'SOLANA_PROGRAM_LIBRARY' || tx.source === 'PHANTOM') &&
    tx.type === 'TRANSFER',
  showNFTView:
    tx.source === 'MAGIC_EDEN' ||
    tx.source === 'TENSOR' ||
    tx.type === 'COMPRESSED_NFT_MINT',
  showDescription:
    tx.source !== 'MAGIC_EDEN' &&
    tx.source !== 'SOLANA_PROGRAM_LIBRARY' &&
    tx.type !== 'COMPRESSED_NFT_MINT' &&
    tx.type !== 'SWAP' &&
    tx.type !== 'TRANSFER',
  showTransferList:
    tx.source !== 'SYSTEM_PROGRAM' && tx.source !== 'SOLANA_PROGRAM_LIBRARY',
})
