import { OverflowContentWrapper } from '@/components-new-version/common/overflow-content-wrapper'
import { RightSideLayout } from '@/components-new-version/common/right-side-layout'
import { ProfileContent } from '@/components-new-version/profile/profile-content'

export default function Profile() {
  return (
    <>
      <OverflowContentWrapper>
        <ProfileContent id="cedrick" />
      </OverflowContentWrapper>
      <RightSideLayout>
        <p>right</p>
      </RightSideLayout>
    </>
  )
}
