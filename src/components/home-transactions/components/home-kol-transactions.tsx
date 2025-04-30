'use client'

import { Spinner } from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useGetHomeKolTransactions } from '../hooks/use-get-home-kol-transactions'
import { HomeTransactionEntry } from './home-transaction-entry'

export function HomeKolTransactions() {
  const { walletAddress } = useCurrentWallet()
  const { transactions, loading } = useGetHomeKolTransactions()

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-[400px]">
        <Spinner large />
      </div>
    )
  }

  return (
    <>
      {transactions?.map((transaction, index) => (
        <HomeTransactionEntry
          key={transaction.signature + index}
          transaction={transaction}
          walletAddress={walletAddress}
        />
      ))}
    </>
  )
}
