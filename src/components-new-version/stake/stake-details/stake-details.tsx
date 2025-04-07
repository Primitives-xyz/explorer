'use client'

import { BottomDetails } from '@/components-new-version/stake/stake-details/bottom-details'
import { TopDetails } from '@/components-new-version/stake/stake-details/top-details'
import { useTranslations } from 'next-intl'

export function StakeDetails() {
  const t = useTranslations()

  return (
    <div className="space-y-6">
      <TopDetails />
      <BottomDetails />
    </div>
  )
}
