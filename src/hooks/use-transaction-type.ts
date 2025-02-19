import type { Transaction } from '@/utils/helius/types'

const COMMISSION_WALLET = '8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz'

export function useTransactionType(tx: Transaction) {
  const isComment =
    tx.tokenTransfers?.length === 2 &&
    tx.tokenTransfers.some(
      (t) => t.to === COMMISSION_WALLET && t.amount === 20
    ) &&
    tx.tokenTransfers.some((t) => t.to !== COMMISSION_WALLET && t.amount === 80)

  const isSwap = tx.type === 'SWAP'
  const isSolanaTransfer =
    tx.source === 'SYSTEM_PROGRAM' && tx.type === 'TRANSFER'
  const isSPLTransfer =
    (tx.source === 'SOLANA_PROGRAM_LIBRARY' || tx.source === 'PHANTOM') &&
    tx.type === 'TRANSFER'
  const isNFTTransaction =
    tx.source === 'MAGIC_EDEN' ||
    tx.source === 'TENSOR' ||
    tx.type === 'COMPRESSED_NFT_MINT'

  return {
    isComment,
    isSwap,
    isSolanaTransfer,
    isSPLTransfer,
    isNFTTransaction,
  }
}
