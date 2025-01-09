import { TokenMetadata } from '@/types/transaction'
import { Transaction } from '@/utils/helius/types'
import { getTokenMetadata } from '@/utils/helius/token-api'

export const enrichTransactions = async (transactions: Transaction[]): Promise<Transaction[]> => {
  return Promise.all(
    transactions.map(async (transaction) => {
      if (!transaction.tokenTransfers?.length) {
        return transaction
      }

      const enrichedTransfers = await Promise.all(
        transaction.tokenTransfers.map(async (transfer) => {
          try {
            const metadata = await getTokenMetadata(transfer.mint)
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
