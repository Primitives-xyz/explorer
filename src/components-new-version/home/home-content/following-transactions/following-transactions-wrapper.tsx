'use client'

import {
  Button,
  Card,
  CardContent,
  Paragraph,
} from '@/components-new-version/ui'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { useTranslations } from 'next-intl'
import { FollowingTransactions } from './following-transactions'

export function FollowingTransactionsWrapper() {
  const { mainProfile, isLoggedIn, setShowAuthFlow } = useCurrentWallet()
  const t = useTranslations()

  if (!isLoggedIn || !mainProfile) {
    return (
      <Card>
        <CardContent className="flex flex-col space-y-10 items-center justify-center">
          <Paragraph>
            {t('following_transaction.create_a_profile_to_follow')}
          </Paragraph>
          <Button onClick={() => setShowAuthFlow(true)}>Connect wallet</Button>
        </CardContent>
      </Card>
    )
  }

  return <FollowingTransactions username={mainProfile.username} />
}
