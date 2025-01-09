import { Transaction, TokenTransfer, EnrichedTokenTransfer } from '@/types/transaction'
import { getTokenMetadata } from '@/utils/helius/token-api'

export const enrichTransactions = async (transactions: Transaction[]): Promise<Transaction[]> => {
  return Promise.all(
    transactions.map(async (transaction) => {
      if (!transaction.tokenTransfers?.length) {
        return transaction
      }

      const enrichedTransfers: EnrichedTokenTransfer[] = await Promise.all(
        transaction.tokenTransfers.map(async (transfer: TokenTransfer) => {
          try {
            const metadata = await getTokenMetadata(transfer.tokenMint)
            return {
              ...transfer,
              metadata,
            }
          } catch (error) {
            console.error('Error enriching token transfer:', error)
            return transfer
          }
        })
      )

      return {
        ...transaction,
        enrichedTokenTransfers: enrichedTransfers,
      }
    })
  )
}
