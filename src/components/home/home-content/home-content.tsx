import { HomeTransactions } from '@/components/home-transactions/components/home-transactions'
import { PudgyBanner } from '@/components/pudgy/components/pudgy-banner'
import { SolidScoreSmartCtaWrapper } from '@/components/solid-score/components/smart-cta/solid-score-smart-cta-wrapper'

export function HomeContent() {
  return (
    <div className="w-full pb-6 space-y-4">
      <PudgyBanner />
      <SolidScoreSmartCtaWrapper />
      <HomeTransactions />
    </div>
  )
}
