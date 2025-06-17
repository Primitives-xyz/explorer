import { HomeTransactions } from '@/components/home-transactions/components/home-transactions'
import { PudgyBanner } from '@/components/pudgy/components/pudgy-banner'

export function HomeContent() {
  return (
    <div className="w-full pb-6 space-y-4">
      <PudgyBanner />
      <HomeTransactions />
    </div>
  )
}
