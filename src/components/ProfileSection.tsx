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
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-green-800 p-2">
        <div className="flex justify-between items-center overflow-x-auto scrollbar-none">
          <div className="text-green-500 text-sm font-mono whitespace-nowrap">
            {'>'} profile_info.sol
          </div>
          <div className="text-xs text-green-600 font-mono whitespace-nowrap ml-2">
            COUNT: {profiles.length}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-2 mb-4 border border-red-800 bg-red-900/20 text-red-400">
          <span>! ERROR: {error}</span>
        </div>
      )}

      {/* Profile List */}
      <div className="divide-y divide-green-800/30">
        {isLoading ? (
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> FETCHING PROFILES...'}
          </div>
        ) : profiles.length === 0 ? (
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> NO PROFILES FOUND'}
          </div>
        ) : (
          profiles.map((profile) => (
            <div
              key={profile.profile.username}
              className="p-4 hover:bg-green-900/10"
            >
              <div className="flex items-start gap-4">
                {profile.profile.image && (
                  <img
                    src={profile.profile.image}
                    alt={profile.profile.username}
                    className="w-16 h-16 rounded-lg object-cover bg-black/40 ring-1 ring-green-500/20"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-mono bg-green-900/20 px-2 py-1 rounded">
                        @{profile.profile.username}
                      </span>
                      {profile.profile.bio && (
                        <span className="text-green-600 font-mono">
                          {profile.profile.bio}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 text-xs text-green-600 font-mono">
                      <span>
                        Followers: {profile.followStats?.followers || 0}
                      </span>
                      <span>
                        Following: {profile.followStats?.following || 0}
                      </span>
                    </div>
                    <div className="text-xs text-green-600/50 font-mono">
                      {profile.wallet.address}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
