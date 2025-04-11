import { MainContentWrapper } from '@/components-new-version/common/main-content-wrapper'

export default async function Namespace({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <MainContentWrapper>
      <p>namespace{id}</p>
    </MainContentWrapper>
  )
}
