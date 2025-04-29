'use client'

import { FilterTabs } from '@/components/ui'
import { useState } from 'react'
import { EHomeTransactionFilter } from '../home-transactions.models'
import { HomeFollowingTransactions } from './home-following-transactions'
import { HomeKolTransactions } from './home-kol-transactions'

export function HomeTransactions() {
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
          <HomeFollowingTransactions />
        )}
      </div>
    </div>
  )
}
