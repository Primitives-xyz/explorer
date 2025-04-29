'use client'

import { Button, Paragraph } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { useGetHomeFollowingTransactions } from '../hooks/use-get-home-following-transactions'
import { HomeTransactionEntry } from './home-transaction-entry'

export function HomeFollowingTransactions() {
  const t = useTranslations()
  const { walletAddress, setShowAuthFlow, mainProfile } = useCurrentWallet()
  const { transactions, loading } = useGetHomeFollowingTransactions({
    skip: !mainProfile,
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

  if (!mainProfile) {
    return (
      <Card>
        <CardContent className="flex flex-col space-y-10 items-center justify-center">
          <Paragraph>
            {t('following_transaction.create_a_profile_to_follow')}
          </Paragraph>
          <Button onClick={() => setShowAuthFlow(true)}>Connect Wallet</Button>
        </CardContent>
      </Card>
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
