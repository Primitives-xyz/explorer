'use client'

import { Button, FilterTabs, Paragraph } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { EHomeTransactionFilter } from '../home-transactions.models'
import { HomeFollowingTransactions } from './home-following-transactions'
import { HomeKolTransactions } from './home-kol-transactions'

export function HomeTransactions() {
  const t = useTranslations()
  const { mainProfile, setShowAuthFlow } = useCurrentWallet()
  const [selectedType, setSelectedType] = useState<EHomeTransactionFilter>(
    EHomeTransactionFilter.KOL
  )

  const options = [
    { label: 'Twitter KOL', value: EHomeTransactionFilter.KOL },
    { label: 'Following', value: EHomeTransactionFilter.FOLLOWING },
  ]

  return (
    <div className="w-full">
      <FilterTabs
        options={options}
        selected={selectedType}
        onSelect={setSelectedType}
      />
      <div className="space-y-4">
        {selectedType === EHomeTransactionFilter.KOL && <HomeKolTransactions />}
        {selectedType === EHomeTransactionFilter.FOLLOWING && (
          <>
            {mainProfile?.username ? (
              <HomeFollowingTransactions username={mainProfile.username} />
            ) : (
              <Card>
                <CardContent className="flex flex-col space-y-10 items-center justify-center">
                  <Paragraph>
                    {t('following_transaction.create_a_profile_to_follow')}
                  </Paragraph>
                  <Button onClick={() => setShowAuthFlow(true)}>
                    Connect Wallet
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
