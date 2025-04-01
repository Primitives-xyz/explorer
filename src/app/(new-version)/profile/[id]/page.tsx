import { MainContentWrapper } from '@/components-new-version/common/main-content-wrapper'
import { ProfileContent } from '@/components-new-version/profile/profile-content'

export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <MainContentWrapper>
      <ProfileContent id={id} />
    </MainContentWrapper>
  )
}
