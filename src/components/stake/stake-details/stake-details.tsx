'use client'

import { BottomDetails } from '@/components/stake/stake-details/bottom-details'
import { TopDetails } from '@/components/stake/stake-details/top-details'

export function StakeDetails() {
  return (
    <div className="space-y-4">
      <TopDetails />
      <BottomDetails />
    </div>
  )
}
