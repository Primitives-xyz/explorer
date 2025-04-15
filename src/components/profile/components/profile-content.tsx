'use client'

import { IGetProfileResponse } from '@/components/models/profiles.models'
import { ProfileHeader } from './profile-header'
import { ProfileSocial } from './profile-social'
import { ProfileWallets } from './profile-wallets'

interface Props {
  profileInfo: IGetProfileResponse
}

export function ProfileContent({ profileInfo }: Props) {
  return (
    <div className="flex flex-col w-full space-y-6 pb-6">
      <ProfileHeader profileInfo={profileInfo} />
      <div className="grid grid-cols-2 gap-4">
        <ProfileWallets walletAddress={profileInfo.walletAddress} />
        <ProfileSocial walletAddress={profileInfo.walletAddress} />
      </div>
    </div>
  )
}
