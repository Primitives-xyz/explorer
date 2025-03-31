import { OverflowContentWrapper } from '@/components-new-version/common/overflow-content-wrapper'
import { RightSideLayout } from '@/components-new-version/common/right-side-layout'
import { ProfileContent } from '@/components-new-version/profile/profile-content'

export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

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
