import type { Metadata } from 'next'

/**
 * Generates metadata for a profile
 */
export function generateProfileMetadata(username: string): Metadata {
  const title = `@${username} | Explorer`
  const description = `Follow @${username} on Explorer to see their activity on Solana`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Explorer',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      creator: '@explorer',
      site: '@explorer',
    },
  }
}
