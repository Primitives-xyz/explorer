import { Badge, Card, CardContent, CardHeader } from '@/components/ui'
import { getSourceIcon, LAMPORTS_PER_SOL } from '@/utils/transactions'
import Image from 'next/image'
import { IHomeTransaction } from '../home-transactions.models'
import { TransactionsHeader } from './transactions-header'

interface Props {
  transaction: IHomeTransaction
  sourceWallet: string
}

export function SolTransferTransactions({ transaction, sourceWallet }: Props) {
  if (!transaction.nativeTransfers) return null

  const amount =
    transaction.nativeTransfers?.[0]?.amount / LAMPORTS_PER_SOL || 0

  return (
    <Card>
      <CardHeader>
        <TransactionsHeader
          transaction={transaction}
          sourceWallet={sourceWallet}
        >
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="rounded-md">
              transferred SOL
            </Badge>
            {transaction.source && (
              <>
                <p>on</p>
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
