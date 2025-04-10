import {
  IGetProfilesResponseEntry,
  ISuggestedUsername,
} from '@/components-new-version/models/profiles.models'
import { useMemo } from 'react'
import { useGroupedNFTData } from './use-grouped-nft-data'

interface UseSuggestedProfileDataProps {
  suggestedProfiles?: IGetProfilesResponseEntry[]
  loadingSuggestions: boolean
  walletAddress: string
}

interface UseSuggestedProfileDataReturn {
  suggestedUsernames: ISuggestedUsername[]
  usernameGroups: Map<string, ISuggestedUsername[]>
  suggestedImages: string[]
  suggestedBios: string[]
  loadingSuggestions: boolean
  loading: boolean
}

export function useGetSuggestions({
  suggestedProfiles,
  loadingSuggestions,
  walletAddress,
}: UseSuggestedProfileDataProps): UseSuggestedProfileDataReturn {
  // Group usernames by their base name to find duplicates
  const usernameGroups = useMemo(() => {
    return (suggestedProfiles || [])
      .map((profile) => {
        if (profile?.profile?.username) {
          return {
            username: profile.profile.username,
            namespace: profile.profile.namespace,
            readableName: profile.namespace.readableName,
            faviconURL: profile.namespace.faviconURL,
            image: profile.profile.image,
          } as ISuggestedUsername
        }
        return null
      })
      .filter((item): item is ISuggestedUsername => item !== null)
      .reduce((groups, profile) => {
        const group = groups.get(profile.username) || []
        group.push(profile)
        groups.set(profile.username, group)
        return groups
      }, new Map<string, ISuggestedUsername[]>())
  }, [suggestedProfiles])

  // Create array of unique usernames, using the first occurrence's details
  const suggestedUsernames = useMemo(() => {
    return Array.from(usernameGroups.entries())
      .sort(
        (
          a: [string, ISuggestedUsername[]],
          b: [string, ISuggestedUsername[]]
        ) => {
          // Sort by number of profiles in descending order
          const profilesA = a[1]
          const profilesB = b[1]
          return profilesB.length - profilesA.length
        }
      )
      .map((entry: [string, ISuggestedUsername[]]) => entry[1][0])
      .filter((profile): profile is ISuggestedUsername => !!profile)
  }, [usernameGroups])

  // Fetch NFT data if wallet address is provided
  const {
    collections,
    loading: loading,
    enhancedNFTs,
  } = useGroupedNFTData(
    walletAddress,
    false, // Don't show fungible tokens
    false, // Don't show native balance
    20 // Limit to 20 NFTs for performance
  )

  // Get unique suggested profile images, including NFT images
  const suggestedImages = useMemo(() => {
    // Get images from suggested profiles
    const profileImages = Array.from(
      new Set(
        suggestedUsernames
          .map((profile) => profile.image)
          .filter((image): image is string => !!image)
      )
    )

    // Get images from NFTs
    const nftImages: string[] = []

    // First try to get collection images (usually higher quality)
    collections.forEach((collection) => {
      if (collection.collectionImage && collection.verified) {
        nftImages.push(collection.collectionImage)
      }
    })

    // Then add individual NFT images, prioritizing non-spam NFTs
    enhancedNFTs.forEach((nft) => {
      if (!nft.isSpam && nft.hasValidImage !== false) {
        // Extract image URL from NFT
        let imageUrl: string | null = null

        if (nft.content?.links?.image) {
          imageUrl = nft.content.links.image
        } else if (nft.content?.files && nft.content.files.length > 0) {
          imageUrl =
            nft.content.files[0].cdn_uri || nft.content.files[0].uri || null
        }

        if (imageUrl && !nftImages.includes(imageUrl)) {
          nftImages.push(imageUrl)
        }
      }
    })

    // Combine and deduplicate all images
    return Array.from(new Set([...profileImages, ...nftImages])).slice(0, 12) // Limit to 12 images
  }, [suggestedUsernames, collections, enhancedNFTs])

  // Get unique suggested bios from all profiles
  const suggestedBios = useMemo(() => {
    return Array.from(
      new Set(
        (suggestedProfiles || [])
          .map((profile) => profile.profile.bio)
          .filter(
            (bio): bio is string =>
              !!bio &&
              bio.trim() !== '' &&
              !bio.toLowerCase().includes('highest score')
          )
      )
    )
  }, [suggestedProfiles])

  return {
    suggestedUsernames,
    usernameGroups,
    suggestedImages,
    suggestedBios,
    loadingSuggestions,
    loading,
  }
}
