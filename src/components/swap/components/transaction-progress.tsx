'use client'

import { TransactionStatusUpdate } from '@/app/api/jupiter/send-and-confirm/route'

interface TransactionProgressProps {
  status: TransactionStatusUpdate | null
  signature?: string
  error?: string | null
}

export function TransactionProgress({
  status,
  signature,
  error,
}: TransactionProgressProps) {
  if (!status) return null

  const getStatusIcon = () => {
    switch (status.status) {
      case 'sending':
      case 'sent':
      case 'confirming':
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
        )
      case 'confirmed':
        return (
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )
      case 'failed':
      case 'timeout':
        return (
          <svg
            className="w-4 h-4 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )
    }
  }

  const getStatusText = () => {
    switch (status.status) {
      case 'sending':
        return 'Preparing transaction...'
      case 'sent':
        return 'Transaction sent, waiting for confirmation...'
      case 'confirming':
        return 'Confirming on blockchain...'
      case 'confirmed':
        return 'Transaction confirmed!'
      case 'failed':
        return error || 'Transaction failed'
      case 'timeout':
        return 'Transaction timed out'
    }
  }

  const getProgressPercentage = () => {
    switch (status.status) {
      case 'sending':
        return 25
      case 'sent':
        return 50
      case 'confirming':
        return 75
      case 'confirmed':
        return 100
      case 'failed':
      case 'timeout':
        return 0
    }
  }

  // Compact view for confirmed state
  if (status.status === 'confirmed') {
    return (
      <div className="flex items-center justify-center gap-2 py-2">
        {getStatusIcon()}
        <span className="text-sm text-primary font-medium">
          Swap successful!
        </span>
        {signature && (
          <a
            href={`${
              process.env.NEXT_PUBLIC_APP_URL || window.location.origin
            }/${signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary/80 hover:text-primary transition-colors"
          >
            View →
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm text-foreground/80">{getStatusText()}</span>
        </div>
        {signature && status.status !== 'sending' && (
          <a
            href={`${
              process.env.NEXT_PUBLIC_APP_URL || window.location.origin
            }/${signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary/80 hover:text-primary transition-colors"
          >
            View →
          </a>
        )}
      </div>

      {/* Progress bar */}
      {(status.status === 'sending' ||
        status.status === 'sent' ||
        status.status === 'confirming') && (
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      )}
    </div>
  )
}
