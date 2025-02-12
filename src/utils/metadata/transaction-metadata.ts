import type { Metadata } from 'next'

/**
 * Generates metadata for a transaction
 */
export function generateTransactionMetadata(signature: string): Metadata {
  const truncatedSignature = signature.slice(0, 8)
  const title = `Transaction ${truncatedSignature}... | Explorer`
  const description = `View details for Solana transaction ${signature}`

  const ogImageUrl = `/api/og?${new URLSearchParams({
    title,
    description,
    type: 'transaction',
    signature,
  }).toString()}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
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
