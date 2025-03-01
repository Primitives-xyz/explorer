import { SuggestedProfile, SuggestedUsername } from '@/types/profile.types'
import { useMemo } from 'react'

interface UseSuggestedProfileDataProps {
  suggestedProfiles: SuggestedProfile[] | null
  loadingSuggestions: boolean
}

interface UseSuggestedProfileDataReturn {
  suggestedUsernames: SuggestedUsername[]
  usernameGroups: Map<string, SuggestedUsername[]>
  suggestedImages: string[]
  suggestedBios: string[]
  loadingSuggestions: boolean
}

export function useSuggestedProfileData({
  suggestedProfiles,
  loadingSuggestions,
}: UseSuggestedProfileDataProps): UseSuggestedProfileDataReturn {
  // Group usernames by their base name to find duplicates
  const usernameGroups = useMemo(() => {
    return ((suggestedProfiles || []) as SuggestedProfile[])
      .map((profile) => {
        if (
          profile.profile?.username &&
          profile.profile?.namespace &&
          profile.namespace
        ) {
          return {
            username: profile.profile.username,
            namespace: profile.profile.namespace,
            readableName: profile.namespace.readableName,
            faviconURL: profile.namespace.faviconURL || null,
            image: profile.profile.image,
          } as SuggestedUsername
        }
        return null
      })
      .filter((item): item is SuggestedUsername => item !== null)
      .reduce((groups, profile) => {
        const group = groups.get(profile.username) || []
        group.push(profile)
        groups.set(profile.username, group)
        return groups
      }, new Map<string, SuggestedUsername[]>())
  }, [suggestedProfiles])

  // Create array of unique usernames, using the first occurrence's details
  const suggestedUsernames = useMemo(() => {
    return Array.from(usernameGroups.entries())
      .sort(
        (
          a: [string, SuggestedUsername[]],
          b: [string, SuggestedUsername[]]
        ) => {
          // Sort by number of profiles in descending order
          const profilesA = a[1]
          const profilesB = b[1]
          return profilesB.length - profilesA.length
        }
      )
      .map((entry: [string, SuggestedUsername[]]) => entry[1][0])
      .filter((profile): profile is SuggestedUsername => !!profile)
  }, [usernameGroups])

  // Get unique suggested profile images
  const suggestedImages = useMemo(() => {
    return Array.from(
      new Set(
        suggestedUsernames
          .map((profile) => profile.image)
          .filter((image): image is string => !!image)
      )
    )
  }, [suggestedUsernames])

  // Get unique suggested bios from all profiles
  const suggestedBios = useMemo(() => {
    return Array.from(
      new Set(
        ((suggestedProfiles || []) as SuggestedProfile[])
          .map((profile) => profile.profile?.bio)
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
  }
}
