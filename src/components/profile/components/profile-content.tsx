'use client'

import { BackgroundTheme } from '@/components/pudgy/components/background-theme'
import { UserScoreCard } from '@/components/scoring/user-score-card'
import { IGetProfileResponse } from '@/components/tapestry/models/profiles.models'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { ProfileHeader } from './profile-header/profile-header'
import { ProfileSocial } from './profile-social'
import { ProfileWallets } from './profile-wallets'

interface Props {
  profileInfo: IGetProfileResponse
  walletAddress: string
}

export function ProfileContent({ profileInfo, walletAddress }: Props) {
  const { mainProfile } = useCurrentWallet()

  // Only show score card if viewing own profile
  const isOwnProfile = mainProfile?.username === profileInfo.profile.username

  return (
    <>
      <BackgroundTheme profile={profileInfo.profile} />
      <div className="flex flex-col w-full space-y-6 pb-6 relative">
        <ProfileHeader
          profileInfo={profileInfo}
          walletAddress={walletAddress}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileWallets
            walletAddress={walletAddress}
            profile={profileInfo.profile}
          />
          <ProfileSocial
            walletAddress={walletAddress}
            profile={profileInfo.profile}
          />
          {isOwnProfile && (
            <div className="md:col-span-2">
              <UserScoreCard />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
