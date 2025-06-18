import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { NamespaceContent } from '@/components/namespace/hooks/namespace-content'
import { StatusBar } from '@/components/status-bar/status-bar'

export default async function Namespace({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <MainContentWrapper className="max-w-main-content mx-auto flex flex-col justify-center">
      <StatusBar condensed />
      <NamespaceContent id={id} />
    </MainContentWrapper>
  )
}
