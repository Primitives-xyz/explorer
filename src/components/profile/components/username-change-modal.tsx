'use client'

import { Button } from '@/components/ui'
import { AlertTriangle } from 'lucide-react'

interface UsernameChangeModalProps {
  isOpen: boolean
  currentUsername: string
  newUsername: string
  error?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

// Helper function to parse error messages
const parseErrorMessage = (error: any): string => {
  try {
    if (typeof error === 'string') return error
    if (typeof error.message === 'string') {
      // Try to extract JSON from the error message
      const jsonMatch = error.message.match(/\{.*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.error) {
          return parsed.error
        }
      }
    }
    return error.message || 'An unexpected error occurred'
  } catch {
    return error?.message || 'An unexpected error occurred'
  }
}

export function UsernameChangeModal({
  isOpen,
  currentUsername,
  newUsername,
  error,
  loading = false,
  onConfirm,
  onCancel,
}: UsernameChangeModalProps) {
  if (!isOpen) return null

  const parsedError = error ? parseErrorMessage(error) : ''

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg shadow-lg max-w-md mx-4 w-full">
        {/* Header */}
        <div className="flex flex-col space-y-2 p-6 pb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            ⚠️ Change Username?
          </h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              This will change your profile URL from <br />
              <code className="bg-muted px-1 rounded">
                /{currentUsername}
              </code>{' '}
              to <code className="bg-muted px-1 rounded">/{newUsername}</code>
            </p>
            <p className="text-xs">You'll be redirected to the new URL!</p>
          </div>

          {/* Error message */}
          {parsedError && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{parsedError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4">
          <Button variant="outline" onClick={onCancel} className="mt-2 sm:mt-0">
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? 'Changing...' : 'Confirm Change'}
          </Button>
        </div>
      </div>
    </div>
  )
}
