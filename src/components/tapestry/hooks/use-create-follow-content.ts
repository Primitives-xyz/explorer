import type { FollowContent } from '@/types/content'
import { EXPLORER_NAMESPACE } from '@/utils/constants'

interface CreateFollowContentParams {
  followerUsername: string
  followeeUsername: string
  followerAddress?: string
  followeeAddress?: string
}

export function useCreateFollowContent() {
  const createContentNode = async ({
    followerUsername,
    followeeUsername,
    followerAddress,
    followeeAddress,
  }: CreateFollowContentParams) => {
    try {
      // Generate a unique ID for this follow action
      const followId = `follow_${followerUsername}_${followeeUsername}_${Date.now()}`

      // Fetch profile information for both users
      const [followerProfiles, followeeProfiles] = await Promise.all([
        fetch(`/api/profiles?username=${followerUsername}`).then((res) =>
          res.json()
        ),
        fetch(`/api/profiles?username=${followeeUsername}`).then((res) =>
          res.json()
        ),
      ])

      const followerProfile = followerProfiles.profiles?.find(
        (p: any) => p.namespace.name === EXPLORER_NAMESPACE
      )?.profile

      const followeeProfile = followeeProfiles.profiles?.find(
        (p: any) => p.namespace.name === EXPLORER_NAMESPACE
      )?.profile

      // Fetch additional stats for both users
      const [followerStats, followeeStats] = await Promise.all([
        fetch(`/api/followers/count?username=${followerUsername}`).then((res) =>
          res.json()
        ).catch(() => ({ followersCount: 0, followingCount: 0 })),
        fetch(`/api/followers/count?username=${followeeUsername}`).then((res) =>
          res.json()
        ).catch(() => ({ followersCount: 0, followingCount: 0 })),
      ])

      // Check if followee follows back (mutual follow)
      let isMutualFollow = false
      try {
        const mutualCheckResponse = await fetch(
          `/api/followers/check?follower=${followeeUsername}&followee=${followerUsername}`
        )
        const mutualCheck = await mutualCheckResponse.json()
        isMutualFollow = mutualCheck.isFollowing || false
      } catch (err) {
        console.error('Error checking mutual follow:', err)
      }

      // Create the content object
      const content: FollowContent = {
        type: 'follow',
        timestamp: String(Date.now()),

        // Follower details
        followerUsername,
        followerAddress: followerAddress || followerProfile?.walletAddress || '',
        followerImage: followerProfile?.image || '',
        followerBio: followerProfile?.bio || '',
        followerFollowersCount: String(followerStats.followersCount || 0),
        followerFollowingCount: String(followerStats.followingCount || 0),

        // Followee details
        followeeUsername,
        followeeAddress: followeeAddress || followeeProfile?.walletAddress || '',
        followeeImage: followeeProfile?.image || '',
        followeeBio: followeeProfile?.bio || '',
        followeeFollowersCount: String(followeeStats.followersCount || 0),
        followeeFollowingCount: String(followeeStats.followingCount || 0),

        // Relationship details
        isMutualFollow: String(isMutualFollow),
        followId,
      }

      // Convert content object to properties array
      const contentToProperties = (obj: Record<string, any>) => {
        return Object.entries(obj).map(([key, value]) => ({
          key,
          value: String(value),
        }))
      }

      // Post the content to the API
      await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: followId,
          profileId: followerUsername,
          properties: contentToProperties(content),
        }),
      })

      return { success: true, followId }
    } catch (err) {
      console.error('Error creating follow content node:', err)
      return { success: false, error: err }
    }
  }

  return { createContentNode }
}