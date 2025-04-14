import { getNamespaceProfiles } from '@/components-new-version/namespace/hooks/get-namepace-profiles'
import { getNamespaceDetails } from '@/components-new-version/namespace/hooks/get-namespace-details'
import { NamespaceHeader } from '@/components-new-version/namespace/hooks/namespace-header'
import { NamespaceProfiles } from '@/components-new-version/namespace/namespace-profiles'

interface Props {
  id: string
}

export async function NamespaceContent({ id }: Props) {
  const { namespaceDetails } = await getNamespaceDetails({ name: id })
  const { profiles } = await getNamespaceProfiles({ name: id })

  if (!namespaceDetails) {
    return (
      <div className="flex w-full items-center justify-center">
        <div>Namespace not found</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full gap-6">
      <NamespaceHeader namespaceDetails={namespaceDetails} />
      <NamespaceProfiles profiles={profiles} />
    </div>
  )
}
