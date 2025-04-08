import { Transaction } from '@/components-new-version/models/helius.models'
import { useGetProfiles } from '@/components-new-version/tapestry/hooks/use-get-profiles'
import { TransactionsHeader } from '@/components-new-version/transactions/transactions-header'
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
} from '@/components-new-version/ui'
import { getSourceIcon } from '@/components-new-version/utils/transactions'

interface Props {
  transaction: Transaction
  sourceWallet: string
}

export function OtherTransactions({ transaction, sourceWallet }: Props) {
  const { profiles } = useGetProfiles({
    walletAddress: sourceWallet,
  })
  return (
    <Card>
      <CardHeader>
        <TransactionsHeader
          transaction={transaction}
          sourceWallet={sourceWallet}
          profiles={profiles}
        >
          <div>
            {transaction.source && (
              <>
                <Badge className="rounded-md" variant="outline">
                  {getSourceIcon(transaction.source)}
                  <span>{transaction.source}</span>
                </Badge>
              </>
            )}
          </div>
        </TransactionsHeader>
      </CardHeader>
      <CardContent>
        <div className="flex bg-card-accent rounded-lg px-4 gap-4 items-center justify-between h-12 ml-12">
          <p className="text-xs">No description available</p>
        </div>
      </CardContent>
    </Card>
  )
}
