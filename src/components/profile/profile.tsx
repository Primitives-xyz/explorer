import { FollowButton } from '@/components/profile/follow-button'
import { ProfileInfos } from '@/components/profile/profile-infos'
import { useEffect, useState } from 'react'
import { Card } from '../common/card'

interface Props {
  username: string
}

interface ProfileData {
  walletAddress: string
  socialCounts?: {
    followers: number
    following: number
  }
}

export function Profile({ username }: Props) {
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/profiles/${username}`)
        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }
        const profileData = await response.json()
        setData(profileData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  if (loading) {
    return (
      <Card>
        <div className="p-4">
          <div className="h-8 bg-green-900/20 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-green-900/20 rounded animate-pulse w-1/2"></div>
        </div>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <div className="p-4 text-center text-green-600">Profile not found</div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex justify-between items-center">
        <div className="flex flex-col justify-center space-y-2 w-full h-full">
          <ProfileInfos
            username={username}
            walletAddress={data.walletAddress || ''}
          />
        </div>
        <FollowButton username={username} />
      </div>
    </Card>
  )
}
