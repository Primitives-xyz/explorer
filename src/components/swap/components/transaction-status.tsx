'use client'

import { TransactionStatusUpdate } from '@/app/api/jupiter/send-and-confirm/route'

interface TransactionStatusProps {
  status: TransactionStatusUpdate | null
}

export function TransactionStatus({ status }: TransactionStatusProps) {
  if (
    !status ||
    status.status === 'confirmed' ||
    status.status === 'failed' ||
    status.status === 'timeout'
  ) {
    return null
  }

  const getStatusText = () => {
    switch (status.status) {
      case 'sending':
        return 'Preparing transaction...'
      case 'sent':
        return 'Transaction sent to network...'
      case 'confirming':
        return 'Confirming on blockchain...'
      default:
        return ''
    }
  }

  const getProgressWidth = () => {
    switch (status.status) {
      case 'sending':
        return '33%'
      case 'sent':
        return '66%'
      case 'confirming':
        return '90%'
      default:
        return '0%'
    }
  }

  return (
    <div className="w-full px-4 -mt-2 mb-2">
      <div className="relative">
        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: getProgressWidth() }}
          />
        </div>

        {/* Status text */}
        <div className="flex items-center justify-center mt-1">
          <span className="text-xs text-muted-foreground">
            {getStatusText()}
          </span>
        </div>
      </div>
    </div>
  )
}
