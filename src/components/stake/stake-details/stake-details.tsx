'use client'

import { BottomDetails } from '@/components/stake/stake-details/bottom-details'
import { TopDetails } from '@/components/stake/stake-details/top-details'
import { useTranslations } from 'next-intl'

export function StakeDetails() {
  const t = useTranslations()

  return (
    <div className="space-y-4">
      <TopDetails />
      <BottomDetails />
    </div>
  )
}
