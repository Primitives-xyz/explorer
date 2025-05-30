import { useGetProfiles } from '@/components/tapestry/hooks/use-get-profiles'
import { Transaction } from '@/components/tapestry/models/helius.models'
import { TransactionsHeader } from '@/components/transactions/transactions-header'
import { Badge, Card, CardContent, CardHeader } from '@/components/ui'
import { getSourceIcon, LAMPORTS_PER_SOL } from '@/utils/transactions'
import Image from 'next/image'

interface Props {
  transaction: Transaction
  sourceWallet: string
}

export function SolTransferTransactions({ transaction, sourceWallet }: Props) {
  const { profiles } = useGetProfiles({
    walletAddress: sourceWallet,
  })

  const amount =
    transaction.nativeTransfers?.[0]?.amount / LAMPORTS_PER_SOL || 0

  return (
    <Card>
      <CardHeader>
        <TransactionsHeader
          transaction={transaction}
          sourceWallet={sourceWallet}
          profiles={profiles}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-2 text-xs">
            <Badge variant="outline" className="rounded-md">
              transferred SOL
            </Badge>
            {transaction.source && (
              <>
                <p className="desktop">on</p>
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
        <div className="flex bg-card-accent rounded-lg px-4 gap-4 items-center justify-between h-12 md:ml-12">
          <div className="bg-card rounded-full w-9 h-9 flex items-center justify-center">
            <Image
              src="/images/solana-icon.svg"
              alt="solana icon"
              width={36}
              height={36}
              className="rounded-full aspect-square"
            />
          </div>
          <div className="flex items-center">
            <span className="text-destructive text-md">-</span>
            <span className="text-md">{amount}</span>
            <span className="font-mono text-base">SOL</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
