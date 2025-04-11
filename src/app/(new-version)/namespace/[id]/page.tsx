import { MainContentWrapper } from '@/components-new-version/common/main-content-wrapper'
import { NamespaceContent } from '@/components-new-version/namespace/hooks/namespace-content'

export default async function Namespace({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <MainContentWrapper className="min-w-main-content max-w-main-content mx-auto flex justify-center">
      <NamespaceContent id={id} />
    </MainContentWrapper>
  )
}
