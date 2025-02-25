import type { Transaction } from '@/utils/helius/types'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export interface TransactionExplanation {
  summaries: {
    brief: string
    detailed: string
  }
  type: {
    primary: string
    secondary: string[]
  }
  details: {
    operations: Array<{
      step: number
      action: string
      description: string
      from: {
        amount: string
        address?: string
      }
      to: {
        amount: string
        address?: string
      }
      priceImpact?: string
    }>
    fees: {
      transactionFee: string
      protocolFees: Array<{
        protocol: string
        amount: string
        token: string
      }>
    }
  }
  protocols: {
    primary: string
    integrated: string[]
  }
  analysis: {
    marketImpact: string
    timing: string
    efficiency: string
    risks: string[]
    recommendations: string[]
  }
}

export function useTransactionExplanation() {
  const [explanation, setExplanation] = useState<TransactionExplanation | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations()

  const getExplanation = async (transaction: Transaction) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transaction }),
      })

      if (!response.ok) {
        console.error('Failed to get LLM response:', await response.text())
        setExplanation(null)
        return
      }

      const data = await response.json()
      setExplanation(data)
    } catch (exception) {
      console.error('Error getting LLM response:', exception)
      setExplanation(null)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    explanation,
    isLoading,
    getExplanation,
  }
}
