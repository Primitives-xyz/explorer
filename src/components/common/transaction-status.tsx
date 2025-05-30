'use client'

import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface TransactionStatus {
  id: string
  type: 'loading' | 'success' | 'error'
  title: string
  description?: string
}

interface TransactionStatusManagerProps {
  status: TransactionStatus | null
  onDismiss?: () => void
}

export function TransactionStatusIndicator({
  status,
  onDismiss,
}: TransactionStatusManagerProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (status) {
      setIsVisible(true)

      // Auto-dismiss success messages after 3 seconds
      if (status.type === 'success') {
        const timeout = setTimeout(() => {
          setIsVisible(false)
          onDismiss?.()
        }, 3000)
        return () => clearTimeout(timeout)
      }
    } else {
      setIsVisible(false)
    }
  }, [status, onDismiss])

  if (!isVisible || !status) return null

  const icons = {
    loading: <Loader2 className="h-5 w-5 animate-spin" />,
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
  }

  const bgColors = {
    loading: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
  }

  return (
    <div
      className={`fixed top-20 right-4 max-w-sm animate-in slide-in-from-top-2 fade-in duration-200 z-50`}
    >
      <div
        className={`flex items-start gap-3 p-4 rounded-lg border ${
          bgColors[status.type]
        } shadow-sm`}
      >
        <div className="flex-shrink-0">{icons[status.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{status.title}</p>
          {status.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {status.description}
            </p>
          )}
        </div>
        {status.type !== 'loading' && (
          <button
            onClick={() => {
              setIsVisible(false)
              onDismiss?.()
            }}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// Hook to manage transaction status
export function useTransactionStatus() {
  const [status, setStatus] = useState<TransactionStatus | null>(null)

  const showStatus = (newStatus: Omit<TransactionStatus, 'id'>) => {
    setStatus({
      ...newStatus,
      id: Date.now().toString(),
    })
  }

  const clearStatus = () => {
    setStatus(null)
  }

  return {
    status,
    showStatus,
    clearStatus,
    showLoading: (title: string, description?: string) =>
      showStatus({ type: 'loading', title, description }),
    showSuccess: (title: string, description?: string) =>
      showStatus({ type: 'success', title, description }),
    showError: (title: string, description?: string) =>
      showStatus({ type: 'error', title, description }),
  }
}
