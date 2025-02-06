import { memo, useEffect } from 'react'
import { Card } from '../common/card'
import type { ProfileData } from '@/hooks/use-profile-data'

interface ProfileStatsProps {
  profileData?: ProfileData
  isLoading: boolean
  onFollowersClick: () => void
  onFollowingClick: () => void
}

export const ProfileStats = memo(function ProfileStats({
  profileData,
  isLoading,
  onFollowersClick,
  onFollowingClick,
}: ProfileStatsProps) {
  useEffect(() => {
    console.log('[ProfileStats] rerender:', {
      followers: profileData?.socialCounts?.followers,
      following: profileData?.socialCounts?.following,
      isLoading,
    })
  })

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <button
          onClick={onFollowersClick}
          className="w-full p-4 text-left hover:bg-green-900/10 transition-colors"
        >
          <h3 className="text-lg font-mono text-green-400 mb-2">Followers</h3>
          <div className="text-3xl font-mono text-green-500">
            {isLoading ? (
              <div className="h-8 bg-green-900/20 rounded animate-pulse w-16" />
            ) : (
              profileData?.socialCounts?.followers || 0
            )}
          </div>
        </button>
      </Card>
      <Card>
        <button
          onClick={onFollowingClick}
          className="w-full p-4 text-left hover:bg-green-900/10 transition-colors"
        >
          <h3 className="text-lg font-mono text-green-400 mb-2">Following</h3>
          <div className="text-3xl font-mono text-green-500">
            {isLoading ? (
              <div className="h-8 bg-green-900/20 rounded animate-pulse w-16" />
            ) : (
              profileData?.socialCounts?.following || 0
            )}
          </div>
        </button>
      </Card>
    </div>
  )
})
