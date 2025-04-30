'use client'

import { Spinner } from '@/components/ui/spinner'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useEffect } from 'react'
import { useGetHomeFollowingTransactions } from '../hooks/use-get-home-following-transactions'
import { HomeTransactionEntry } from './home-transaction-entry'

interface Props {
  username: string
}

export function HomeFollowingTransactions({ username }: Props) {
  const { walletAddress } = useCurrentWallet()
  const { transactions, loading } = useGetHomeFollowingTransactions({
    username,
  })

  useEffect(() => {
    console.log('transactions', transactions)
  }, [transactions])

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
