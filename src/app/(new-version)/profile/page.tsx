import { MainContentWrapper } from '@/components-new-version/common/main-content-wrapper'
import { RightSidebarWrapper } from '@/components-new-version/common/right-sidebar-wrapper'
import { ProfileContent } from '@/components-new-version/profile/profile-content'

export default function Profile() {
  return (
    <>
      <MainContentWrapper>
        <ProfileContent id="cedrick" />
      </MainContentWrapper>
      <RightSidebarWrapper>
        <p>right</p>
      </RightSidebarWrapper>
    </>
  )
}
