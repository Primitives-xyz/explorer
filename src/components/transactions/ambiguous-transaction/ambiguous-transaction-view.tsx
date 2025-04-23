import { Button, ButtonVariant, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { TransferLine } from '@/components/transactions/common/transfer-line'
import { TransactionsHeader } from '@/components/transactions/transactions-header'
import TokenTransferGraph from '@/components/transactions/common/token-transfer-graph'

interface AmbiguousTransactionViewProps {
  transaction: any; // Replace with proper transaction type
}

export const AmbiguousTransactionView = ({ transaction }: AmbiguousTransactionViewProps) => {
  console.log(transaction)
  return (
    <div className="space-y-4">
      {/* Header */}
      <TransactionsHeader transaction={transaction} sourceWallet={transaction.feePayer} />
      {/* Transaction Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Unknown Transaction Type</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
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
        </CardContent>
      </Card>
      {/* Token Transfer Graph */}
      <TokenTransferGraph transaction={transaction} />
      {/* Token Transfers Section */}
      <Card>
        <CardHeader>
          <CardTitle>Token Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          {transaction.tokenTransfers && transaction.tokenTransfers.length > 0 ? (
            <div className="space-y-2">
              {transaction.tokenTransfers.map((tt: any, i: number) => (
                <TransferLine
                  key={i}
                  from={tt.fromUserAccount}
                  to={tt.toUserAccount}
                  mint={tt.mint || tt.tokenMint}
                  amount={tt.tokenAmount}
                  timestamp={transaction.timestamp}
                  direction={tt.fromUserAccount === transaction.feePayer ? 'out' : tt.toUserAccount === transaction.feePayer ? 'in' : undefined}
                  className="bg-[#97EF830D] rounded"
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-3">No token transfers found for this transaction</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 