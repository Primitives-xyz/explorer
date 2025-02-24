import { generateNamespaceMetadata } from '@/utils/metadata/namespace-metadata'
import { getNamespaceDetails, getNamespaceProfiles } from '@/utils/namespace'
import { type NamespaceParams as Params } from '@/utils/validation'
import { Metadata } from 'next'
import { NamespaceClient } from './namespace-client'

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { namespace } = await params
  const namespaceDetails = await getNamespaceDetails(namespace)
  const { totalCount } = await getNamespaceProfiles(namespace)

  if (!namespaceDetails) {
    return {
      title: 'Namespace Not Found',
      description: 'The requested namespace could not be found.',
    }
  }

  return generateNamespaceMetadata(namespaceDetails, totalCount)
}

export default async function Page({ params }: { params: Params }) {
  const { namespace } = await params
  const namespaceDetails = await getNamespaceDetails(namespace)
  const { profiles, totalCount } = await getNamespaceProfiles(namespace)

  return (
    <NamespaceClient
      namespaceDetails={namespaceDetails}
      profiles={profiles}
      totalCount={totalCount}
    />
  )
}

// Force dynamic rendering to ensure data is always fresh
export const dynamic = 'force-dynamic'
