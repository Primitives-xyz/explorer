import { OverflowContentWrapper } from '@/components-new-version/common/overflow-content-wrapper'
import { RightSideLayout } from '@/components-new-version/common/right-side-layout'
import { DiscoverContent } from '@/components-new-version/discover/discover-content'
import { RightSideDiscover } from '@/components-new-version/discover/right-side/right-side-discover'

export default function Discover() {
  return (
    <>
      <OverflowContentWrapper>
        <DiscoverContent />
      </OverflowContentWrapper>
      <RightSideLayout>
        <RightSideDiscover />
      </RightSideLayout>
    </>
  )
}
