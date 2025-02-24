import { INamespaceDetails } from '@/hooks/use-get-namespace-details'
import type { Metadata } from 'next'

/**
 * Generates metadata for a namespace
 */
export async function generateNamespaceMetadata(
  namespaceDetails: INamespaceDetails,
  totalProfiles: number
): Promise<Metadata> {
  const title = namespaceDetails.readableName
  const description = `Explore ${namespaceDetails.readableName} on Explorer`

  const ogImageUrl = `/api/og/namespace?${new URLSearchParams({
    title: namespaceDetails.readableName,
    description,
    totalProfiles: totalProfiles.toString(),
    ...(namespaceDetails.faviconURL
      ? { image: namespaceDetails.faviconURL }
      : {}),
  }).toString()}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Explorer',
      images: [
        {
          url: ogImageUrl,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@explorer',
      site: '@explorer',
      images: [ogImageUrl],
    },
  }
}
