import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { NamespaceProfileRedirect } from '@/components/namespace/profile/namespace-profile-redirect'

export default async function NamespaceProfile({
  params,
}: {
  params: Promise<{ id: string; profile: string }>
}) {
  const { id, profile } = await params

  return (
    <MainContentWrapper className="w-full mx-auto flex justify-center">
      <NamespaceProfileRedirect namespace={id} profile={profile} />
    </MainContentWrapper>
  )
}
