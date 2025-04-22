import { Button, ButtonVariant } from '@/components/ui'

interface AmbiguousTransactionViewProps {
  transaction: any; // Replace with proper transaction type
}

export const AmbiguousTransactionView = ({ transaction }: AmbiguousTransactionViewProps) => {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-2">Unknown Transaction Type</h2>
      <div className="grid gap-2">
        <div>Type: {transaction?.type || 'Unknown'}</div>
        <div className="text-sm text-muted-foreground">
          This type of transaction is not yet supported.
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            variant={ButtonVariant.DEFAULT}
            href={transaction?.signature ? `https://solscan.io/tx/${transaction.signature}` : undefined}
            newTab
          >
            View on Solscan
          </Button>
          <Button
            variant={ButtonVariant.SECONDARY}
            href={transaction?.signature ? `https://solana.fm/tx/${transaction.signature}` : undefined}
            newTab
          >
            View on Solana.fm
          </Button>
        </div>
        {/* Add more generic transaction details here */}
      </div>
    </div>
  )
} 