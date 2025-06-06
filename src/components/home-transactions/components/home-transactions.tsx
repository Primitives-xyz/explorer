'use client'

import { Button, FilterTabs, Paragraph } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { EHomeTransactionFilter } from '../home-transactions.models'
import { HomeAllTransactions } from './home-all-transactions'
import { HomeFollowingTransactions } from './home-following-transactions'
import { HomeKolTransactions } from './home-kol-transactions'

export function HomeTransactions() {
  const t = useTranslations()
  const { mainProfile, setShowAuthFlow } = useCurrentWallet()
  const [selectedType, setSelectedType] = useState<EHomeTransactionFilter>(
    EHomeTransactionFilter.ALL
  )

  const options = [
    { label: t('home.tabs.all'), value: EHomeTransactionFilter.ALL },
    { label: t('home.tabs.twitter_kol'), value: EHomeTransactionFilter.KOL },
    {
      label: t('home.tabs.following'),
      value: EHomeTransactionFilter.FOLLOWING,
    },
  ]

  return (
    <div className="w-full">
      <div className="flex items-start justify-between">
        <FilterTabs
          options={options}
          selected={selectedType}
          onSelect={setSelectedType}
        />
      </div>
      <div className="space-y-4">
        {selectedType === EHomeTransactionFilter.ALL && <HomeAllTransactions />}
        {selectedType === EHomeTransactionFilter.KOL && <HomeKolTransactions />}
        {selectedType === EHomeTransactionFilter.FOLLOWING && (
          <>
            {mainProfile?.username ? (
              <HomeFollowingTransactions username={mainProfile.username} />
            ) : (
              <Card>
                <CardContent className="flex flex-col space-y-10 items-center justify-center">
                  <Paragraph>{t('home.create_a_profile_to_follow')}</Paragraph>
                  <Button onClick={() => setShowAuthFlow(true)}>
                    {t('common.connect_wallet')}
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
