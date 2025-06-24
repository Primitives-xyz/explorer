import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { NamespaceProfileContent } from '@/components/namespace/profile/namespace-profile-content'
import { StatusBar } from '@/components/status-bar/status-bar'
import { Button, ButtonVariant } from '@/components/ui'
import { route } from '@/utils/route'
import { ChevronLeft } from 'lucide-react'

export default async function NamespaceProfile({
  params,
}: {
  params: Promise<{ id: string; profile: string }>
}) {
  const { id, profile } = await params

  return (
    <MainContentWrapper className="w-full mx-auto flex flex-col justify-center">
      <StatusBar condensed />
      <div className="w-full flex flex-col items-start space-y-6">
        <Button href={route('namespace', { id })} variant={ButtonVariant.LINK}>
          <ChevronLeft size={14} />
          go back
        </Button>
        <NamespaceProfileContent namespace={id} profile={profile} />
      </div>
    </MainContentWrapper>
  )
}
