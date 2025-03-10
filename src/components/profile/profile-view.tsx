'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { ProfileIdentities } from '@/components/profile/profile-identities'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { UserHeader } from '@/components/user-header/user-header'
import { useProfileData } from '@/hooks/use-profile-data'

interface Props {
  username: string
}

export function ProfileView({ username }: Props) {
  // Get the mainUsername from the useCurrentWallet hook
  const { mainUsername } = useCurrentWallet()

  const { profileData, isLoading } = useProfileData(username, mainUsername)

  const targetWalletAddress = profileData?.walletAddress || ''
  const isOwnWallet = mainUsername === username

  return (
    <div className="min-h-screen bg-[#111111] text-gray-200 font-mono">
      <UserHeader
        user={{
          username: username,
          walletAddress: targetWalletAddress,
          avatarUrl: profileData?.profile.image || null,
          bio: profileData?.profile.bio || '',
          socialCounts: profileData?.socialCounts,
          userProfileURL: profileData?.namespace?.userProfileURL,
          namespace: profileData?.namespace?.name,
          createdAt: profileData?.profile.created_at,
          isLoading: isLoading,
        }}
        isOwnProfile={isOwnWallet}
      />
      {username && <ProfileIdentities 
        walletAddress={targetWalletAddress} />}
      <div className="container mx-auto">
        <ProfileTabs
          username={username}
          targetWalletAddress={targetWalletAddress}
        />
      </div>
    </div>
  )
}
