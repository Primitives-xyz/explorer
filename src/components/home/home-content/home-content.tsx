'use client'

import { FollowingTransactions } from './following-transactions/following-transactions'

export function HomeContent() {
  return (
    <div className="w-full pb-6">
      <FollowingTransactions />
    </div>
  )
}
