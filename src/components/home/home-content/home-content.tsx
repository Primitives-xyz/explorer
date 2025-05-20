import { SseGlobalFeed } from '@/components/activity-tape/components/sse-global-feed'
import { HomeTransactions } from '@/components/home-transactions/components/home-transactions'

export function HomeContent() {
  return (
    <div className="w-full pb-6 space-y-6">
      <SseGlobalFeed />
      <HomeTransactions />
    </div>
  )
}
