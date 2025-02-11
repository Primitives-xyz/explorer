import type { ProfileData } from '@/hooks/use-profile-data'
import { memo, useEffect } from 'react'
import { Card } from '../common/card'

interface ProfileInfoProps {
  profileData: ProfileData
}

export const ProfileInfo = memo(function ProfileInfo({
  profileData,
}: ProfileInfoProps) {
  useEffect(() => {
    console.log('[ProfileInfo] rerender:', {
      createdAt: profileData.profile?.created_at,
    })
  })

  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-mono text-green-400 mb-4">Profile Info</h3>
        <div className="space-y-2 text-sm font-mono">
          <div className="flex justify-between">
            <span className="text-green-600">Created</span>
            <span className="text-green-400">
              {new Date(profileData.profile?.created_at).getFullYear()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600">Network</span>
            <span className="text-green-400">Solana</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600">Status</span>
            <span className="text-green-400">Active</span>
          </div>
        </div>
      </div>
    </Card>
  )
})
