import { Transaction } from '@/components/tapestry/models/helius.models'
import { TransactionContent } from '@/types/content'
import { useEffect, useState } from 'react'

interface TransactionWithContent {
  transaction: Transaction | null
  content: TransactionContent | null
  isLoading: boolean
  error: string | null
}

export const useTransactionWithContent = (
  signature?: string
): TransactionWithContent => {
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [content, setContent] = useState<TransactionContent | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(!!signature)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTransactionData() {
      if (!signature) {
        setTransaction(null)
        setContent(null)
        setError(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Fetch both transaction and content data in parallel
        const [txResponse, contentResponse] = await Promise.all([
          fetch(`/api/transactions/${signature}`),
          fetch(`/api/content/${signature}`),
        ])

        if (!txResponse.ok) {
          const errorData = await txResponse.json()
          throw new Error(
            errorData.error ||
              `Failed to fetch transaction: ${txResponse.status}`
          )
        }

        const txData = await txResponse.json()
        setTransaction(txData)

        // Content might not exist for all transactions
        if (contentResponse.ok) {
          const contentData = await contentResponse.json()
          // Extract properties into a proper TransactionContent object
          if (contentData?.properties) {
            const contentObj = contentData.properties.reduce(
              (acc: any, prop: any) => {
                acc[prop.key] = prop.value
                return acc
              },
              {}
            )
            setContent(contentObj as TransactionContent)
          }
        }
      } catch (err) {
        console.error('Error fetching transaction data:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch transaction details'
        )
        setTransaction(null)
        setContent(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactionData()
  }, [signature])

  return { transaction, content, isLoading, error }
}
