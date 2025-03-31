import { OverflowContentWrapper } from '@/components-new-version/common/overflow-content-wrapper'
import { ProfileContent } from '@/components-new-version/profile/profile-content'

export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <OverflowContentWrapper>
      <ProfileContent id={id} />
    </OverflowContentWrapper>
  )
}
