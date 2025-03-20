'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { ProfileIdentities } from '@/components/profile/profile-identities'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { UserHeader } from '@/components/user-header/user-header'
import { useProfileData } from '@/hooks/use-profile-data'

interface Props {
  username?: string
  walletAddress?: string
}

export function ProfileView({ username, walletAddress }: Props) {
  const { mainUsername } = useCurrentWallet()

  const { profileData, isLoading } = useProfileData(
    username,
    mainUsername,
    undefined,
    walletAddress
  )
  const targetWalletAddress =
    walletAddress || profileData?.wallet?.address || ''
  const displayUsername = username || profileData?.profile?.username || ''
  const isOwnWallet = mainUsername === displayUsername

  return (
    <div className="min-h-screen bg-[#111111] text-gray-200 font-mono">
      <UserHeader
        username={displayUsername}
        user={{
          username: displayUsername,
          walletAddress: targetWalletAddress,
          avatarUrl: profileData?.profile?.image || null,
          bio: profileData?.profile?.bio || '',
          socialCounts: profileData?.socialCounts,
          userProfileURL: profileData?.namespace?.userProfileURL,
          namespace: profileData?.namespace?.name,
          createdAt: profileData?.profile?.created_at,
          isLoading: isLoading,
        }}
        isOwnProfile={isOwnWallet}
      />
      {displayUsername && (
        <ProfileIdentities walletAddress={targetWalletAddress} />
      )}
      <div className="mx-6">
        <ProfileTabs
          username={displayUsername}
          targetWalletAddress={targetWalletAddress}
        />
      </div>
    </div>
  )
}
