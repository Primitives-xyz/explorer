import type { TokenInfo } from '@/types/token'
import type { Metadata } from 'next'

interface TokenMetadataParams {
  token: NonNullable<TokenInfo['result']>
  imageUrl: string | null
  collection?: {
    group_key: string
    group_value: string
  }
}

/**
 * Determines if a token is an NFT based on its interface
 */
export function isNFTToken(token: NonNullable<TokenInfo['result']>): boolean {
  return (
    token.interface === 'V1_NFT' ||
    token.interface === 'V2_NFT' ||
    token.interface === 'LEGACY_NFT' ||
    token.interface === 'ProgrammableNFT' ||
    token.interface === 'MplCoreAsset' ||
    token.interface === 'MplCoreCollection'
  )
}

/**
 * Resolves the image URL for a token using the same logic as useNFTImage hook
 */
export function resolveTokenImage(
  token: NonNullable<TokenInfo['result']>
): string | null {
  if (!token.content) return null

  return (
    token.content.links?.image ||
    token.content.files?.[0]?.cdn_uri ||
    token.content.files?.[0]?.uri ||
    null
  )
}

/**
 * Generates metadata for a token or NFT
 */
export function generateTokenMetadata({
  token,
  imageUrl,
  collection,
}: TokenMetadataParams): Metadata {
  const isNFT = isNFTToken(token)
  const collectionName = collection ? ` from ${collection.group_value}` : ''

  // Build description with more context
  const description =
    token.content.metadata.description ||
    `View details for ${token.content.metadata.name}${collectionName} ${
      isNFT ? 'NFT' : 'token'
    } on Solana`

  return {
    title: `${token.content.metadata.name} | Explorer`,
    description,
    openGraph: {
      title: `${token.content.metadata.name} ${
        isNFT ? 'NFT' : 'Token'
      } | Explorer`,
      description,
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 1200,
            alt: token.content.metadata.name,
          },
        ],
      }),
      type: isNFT ? 'article' : 'website',
      siteName: 'Explorer',
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title: `${token.content.metadata.name} ${
        isNFT ? 'NFT' : 'Token'
      } | Explorer`,
      description,
      ...(imageUrl && {
        images: [imageUrl],
      }),
      creator: '@explorer',
    },
    ...(imageUrl && {
      icons: {
        icon: imageUrl,
        shortcut: imageUrl,
        apple: imageUrl,
      },
    }),
  }
}
