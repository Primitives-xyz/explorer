import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { RightSidebarWrapper } from '@/components/common/right-sidebar-wrapper'
import { LaunchContent } from '@/components/launch/launch-content'

export default function StakePage() {
  return (
    <>
      <MainContentWrapper className="min-w-main-content max-w-main-content mx-auto pb-12">
        <LaunchContent />
      </MainContentWrapper>
    </>
  )
}
