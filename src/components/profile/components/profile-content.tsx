'use client'

import { BackgroundTheme } from '@/components/pudgy/components/background-theme'
import { IGetProfileResponse } from '@/components/tapestry/models/profiles.models'
import { ProfileHeader } from './profile-header/profile-header'
import { ProfileSocial } from './profile-social'
import { ProfileWallets } from './profile-wallets'

interface Props {
  profileInfo: IGetProfileResponse | null
  walletAddress: string
}

export function ProfileContent({ profileInfo, walletAddress }: Props) {
  const isPudgy = !!profileInfo?.profile?.pudgy_profile_date

  return (
    <>
      {isPudgy && profileInfo.profile.pudgyTheme && (
        <BackgroundTheme pudgyTheme={profileInfo.profile.pudgyTheme} />
      )}
      <div className="flex flex-col w-full space-y-6 pb-6 relative">
        <ProfileHeader
          profileInfo={profileInfo ?? undefined}
          walletAddress={walletAddress}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileWallets walletAddress={walletAddress} />
          <ProfileSocial walletAddress={walletAddress} />
        </div>
      </div>
    </>
  )
}
