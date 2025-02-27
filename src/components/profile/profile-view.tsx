'use client'

import UserHeader from '@/components/UserHeader'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { ProfileIdentities } from '@/components/profile/profile-identities'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { useProfileData } from '@/hooks/use-profile-data'
import { useTargetWallet } from '@/hooks/use-target-wallet'
import { usePortfolioData } from '@/hooks/usePortfolioData'

interface Props {
  username: string
}

export function ProfileView({ username }: Props) {
  // Get the mainUsername from the useCurrentWallet hook
  const { mainUsername } = useCurrentWallet()

  const {
    targetWalletAddress,
    isLoading: isLoadingWallet,
    isOwnWallet,
  } = useTargetWallet(username)

  const { profileData, isLoading } = useProfileData(username, mainUsername)

  // Fetch portfolio data for the wallet address
  const { portfolioData, isLoading: isLoadingPortfolio } =
    usePortfolioData(targetWalletAddress)

  return (
    <div className="min-h-screen bg-[#111111] text-gray-200 font-mono">
      <UserHeader
        user={{
          username: username,
          walletAddress: targetWalletAddress,
          avatarUrl: profileData?.profile.image || null,
          bio: profileData?.profile.bio || '',
          socialCounts: profileData?.socialCounts,
          createdAt: profileData?.profile.created_at,
          isLoading: isLoading || isLoadingWallet,
        }}
        portfolioData={portfolioData}
        isPortfolioLoading={isLoadingPortfolio}
        isOwnProfile={isOwnWallet}
      />
      {username && <ProfileIdentities walletAddress={targetWalletAddress} />}
      <div className="container mx-auto">
        <ProfileTabs username={username} />
      </div>
    </div>
  )
}
