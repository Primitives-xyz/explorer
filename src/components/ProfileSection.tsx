'use client'

import { getFollowStats, getProfiles, Profile } from '@/utils/api'
import { useEffect, useState } from 'react'

interface ProfileWithStats extends Profile {
  followStats?: {
    followers: number
    following: number
  }
}

interface ProfileSectionProps {
  walletAddress: string
  hasSearched?: boolean
}

export const ProfileSection = ({
  walletAddress,
  hasSearched,
}: ProfileSectionProps) => {
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!walletAddress || !hasSearched) return

      setIsLoading(true)
      setError(null)

      try {
        const profilesData = await getProfiles(walletAddress)
        if (!profilesData.items || profilesData.items.length === 0) {
          setProfiles([])
          return
        }

        const profilesWithStats = await Promise.all(
          profilesData.items.map(async (profile) => {
            try {
              const stats = await getFollowStats(profile.profile.username)
              return { ...profile, followStats: stats }
            } catch (error) {
              return { ...profile, followStats: { followers: 0, following: 0 } }
            }
          }),
        )
        setProfiles(profilesWithStats)
      } catch (error) {
        console.error('Profiles fetch error:', error)
        setError('Failed to fetch profiles.')
        setProfiles([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfiles()
  }, [walletAddress, hasSearched])

  if (!hasSearched) return null

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Social Profiles</h2>
      <div className="space-y-4">
        {profiles?.map((profile) => (
          <div
            key={`${profile.profile.id}-${profile.namespace.name}`}
            className="border rounded-lg p-4 relative"
          >
            {/* Namespace Badge - Top Right */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
              {profile.namespace.faviconURL && (
                <img
                  src={profile.namespace.faviconURL}
                  alt={profile.namespace.readableName}
                  className="w-4 h-4"
                />
              )}
              <span className="text-sm text-gray-600">
                {profile.namespace.readableName}
              </span>
            </div>

            {/* Profile Content */}
            <div className="flex items-start gap-4 pr-32"> {/* Added right padding to prevent overlap */}
              {profile.profile.image && (
                <img
                  src={profile.profile.image}
                  alt={profile.profile.username}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              
              <div>
                <h3 className="font-semibold text-lg">
                  {profile.profile.username}
                </h3>
                {profile.profile.bio && (
                  <p className="text-gray-600 mt-1">{profile.profile.bio}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {profile.wallet.address}
                </p>
              </div>
            </div>

            {/* Follow Stats */}
            <div className="mt-4 flex gap-4 text-sm text-gray-600">
              <span>{profile.followStats?.followers || 0} followers</span>
              <span>{profile.followStats?.following || 0} following</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
