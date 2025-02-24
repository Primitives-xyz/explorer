import { generateNamespaceMetadata } from '@/utils/metadata/namespace-metadata'
import { getNamespaceDetails, getNamespaceProfiles } from '@/utils/namespace'
import { Metadata } from 'next'
import { NamespaceClient } from './namespace-client'

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: { namespace: string }
}): Promise<Metadata> {
  const namespaceDetails = await getNamespaceDetails(params.namespace)
  const { totalCount } = await getNamespaceProfiles(params.namespace)

  if (!namespaceDetails) {
    return {
      title: 'Namespace Not Found',
      description: 'The requested namespace could not be found.',
    }
  }

  return generateNamespaceMetadata(namespaceDetails, totalCount)
}

// Server Component
export default async function NamespacePage({
  params,
}: {
  params: { namespace: string }
}) {
  const namespaceDetails = await getNamespaceDetails(params.namespace)
  const { profiles, totalCount } = await getNamespaceProfiles(params.namespace)

  return (
    <NamespaceClient
      namespaceDetails={namespaceDetails}
      profiles={profiles}
      totalCount={totalCount}
    />
  )
}
