import { OverflowContentWrapper } from '@/components-new-version/common/overflow-content-wrapper'
import { RightSideLayout } from '@/components-new-version/common/right-side-layout'
import { ProfileContent } from '@/components-new-version/profile/profile-content'

interface ProfilePageProps {
  params: { id: string }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { id } = params

  return (
    <>
      <OverflowContentWrapper>
        <ProfileContent id={id} />
      </OverflowContentWrapper>
      <RightSideLayout>
        <p>right</p>
      </RightSideLayout>
    </>
  )
}
