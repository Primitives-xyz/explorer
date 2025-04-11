import { MainContentWrapper } from '@/components-new-version/common/main-content-wrapper'
import { NamespaceProfileContent } from '@/components-new-version/namespace/profile/namespace-profile-content'
import { Button, ButtonVariant } from '@/components-new-version/ui'
import { route } from '@/components-new-version/utils/route'
import { ChevronLeft } from 'lucide-react'

export default async function NamespaceProfile({
  params,
}: {
  params: Promise<{ id: string; profile: string }>
}) {
  const { id, profile } = await params

  return (
    <MainContentWrapper className="min-w-main-content max-w-main-content mx-auto flex justify-center">
      <div className="w-full flex flex-col items-start">
        <Button href={route('namespace', { id })} variant={ButtonVariant.LINK}>
          <ChevronLeft size={14} />
          go back
        </Button>

        <NamespaceProfileContent namespace={id} profile={profile} />
      </div>
    </MainContentWrapper>
  )
}
