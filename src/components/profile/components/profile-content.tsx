'use client'

import { IGetProfileResponse } from '@/components/tapestry/models/profiles.models'
import { ProfileHeader } from './profile-header/profile-header'
import { ProfileSocial } from './profile-social'
import { ProfileWallets } from './profile-wallets'

interface Props {
  profileInfo: IGetProfileResponse | null
  walletAddress: string
}

export function ProfileContent({ profileInfo, walletAddress }: Props) {
  if (!profileInfo) {
    return (
      <div className="flex flex-col w-full space-y-6 pb-6">
        <ProfileHeader walletAddress={walletAddress} />
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full space-y-6 pb-6">
      <ProfileHeader profileInfo={profileInfo} walletAddress={walletAddress} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfileWallets walletAddress={profileInfo.walletAddress} />
        <ProfileSocial walletAddress={profileInfo.walletAddress} />
      </div>
    </div>
  )
}
