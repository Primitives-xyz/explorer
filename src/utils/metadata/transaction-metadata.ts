import type { Metadata } from 'next'

/**
 * Generates metadata for a transaction
 */
export function generateTransactionMetadata(signature: string): Metadata {
  const truncatedSignature = signature.slice(0, 8)

  return {
    title: `Transaction ${truncatedSignature}... | Explorer`,
    description: `View details for Solana transaction ${signature}`,
    openGraph: {
      title: `Transaction ${truncatedSignature}... | Explorer`,
      description: `View details for Solana transaction ${signature}`,
      type: 'article',
      siteName: 'Explorer',
    },
    twitter: {
      card: 'summary',
      title: `Transaction ${truncatedSignature}... | Explorer`,
      description: `View details for Solana transaction ${signature}`,
      creator: '@explorer',
    },
  }
}
