import { OverflowContentWrapper } from '@/components-new-version/common/overflow-content-wrapper'
import { FollowingTransactions } from '@/components-new-version/home/home-content/following-transactions/following-transactions'
import { Summary } from '@/components-new-version/home/home-content/summary'

export function HomeContent() {
  return (
    <OverflowContentWrapper>
      <Summary />

      <FollowingTransactions />
    </OverflowContentWrapper>
  )
}
