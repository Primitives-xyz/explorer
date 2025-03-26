import { OverflowContentWrapper } from '@/components-new-version/common/overflow-content-wrapper'
import { FollowingTransactions } from '@/components-new-version/home/home-content/following-transactions/following-transactions'

export function HomeContent() {
  return (
    <OverflowContentWrapper>
      {/* <Summary /> */}
      <FollowingTransactions />
    </OverflowContentWrapper>
  )
}
