'use client'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export function TestToast() {
  const { toast } = useToast()

  const simulateTransaction = () => {
    // Step 1: Sending transaction
    toast({
      title: 'Sending Transaction',
      description: 'Please wait while we process your transaction...',
      variant: 'pending',
      duration: 2000,
    })

    // Step 2: After 2 seconds, show confirming
    setTimeout(() => {
      toast({
        title: 'Confirming Transaction',
        description: (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Waiting for confirmation...</span>
          </div>
        ),
        variant: 'pending',
        duration: 3000,
      })
    }, 2000)

    // Step 3: After 5 seconds total, show success
    setTimeout(() => {
      toast({
        title: 'Transaction Confirmed',
        description:
          'Your transaction has been confirmed on the Solana network!',
        variant: 'success',
        duration: 5000,
      })
    }, 5000)
  }

  const showError = () => {
    toast({
      title: 'Transaction Failed',
      description: 'The transaction failed due to insufficient funds.',
      variant: 'error',
      duration: 5000,
    })
  }

  return (
    <div className="flex gap-4 p-4">
      <Button onClick={simulateTransaction}>Simulate Transaction Flow</Button>

      <Button className="bg-red-600 hover:bg-red-700" onClick={showError}>
        Show Error Toast
      </Button>
    </div>
  )
}
