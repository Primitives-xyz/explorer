import { Transaction } from '@/components/tapestry/models/helius.models'
import { useEffect, useState } from 'react'

export const useTransactionDetails = (signature?: string) => {
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTransactionDetails() {
      if (!signature) {
        setTransaction(null)
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/transactions/${signature}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to fetch transaction: ${response.status}`)
        }
        
        const data = await response.json()
        setTransaction(data)
      } catch (err) {
        console.error('Error fetching transaction details:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch transaction details')
        setTransaction(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactionDetails()
  }, [signature])

  return { transaction, isLoading, error }
} 