'use client'
import UserHeader from '@/components/UserHeader'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { useProfileData } from '@/hooks/use-profile-data'
import { useTargetWallet } from '@/hooks/use-target-wallet'
import { usePortfolioData } from '@/hooks/usePortfolioData'
import { useParams } from 'next/navigation'

// Async server component
export default function ProfilePage() {
  // Use the useParams hook to get the username from the URL
  const params = useParams()
  const username = params.username as string

  // Get the mainUsername from the useCurrentWallet hook
  const { mainUsername } = useCurrentWallet()

  const {
    targetWalletAddress,
    isLoading: isLoadingWallet,
    walletAddressError,
    serverError,
    isOwnWallet,
  } = useTargetWallet(username)

  const {
    profileData,
    followers,
    following,
    comments,
    isLoading,
    isLoadingFollowers,
    isLoadingFollowing,
    isLoadingComments,
  } = useProfileData(username, mainUsername)

  // Fetch portfolio data for the wallet address
  const { portfolioData, isLoading: isLoadingPortfolio } =
    usePortfolioData(targetWalletAddress)

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-mono">
      <UserHeader
        user={{
          username: username,
          walletAddress: targetWalletAddress,
          avatarUrl:
            profileData?.profile.image ||
            '/placeholder.svg?height=200&width=200',
          bio: profileData?.profile.bio || '',
          level: 42,
          reputation: 9876,
          socialCounts: profileData?.socialCounts,
          isLoading: isLoading || isLoadingWallet,
        }}
        portfolioData={portfolioData}
        isPortfolioLoading={isLoadingPortfolio}
      />
      <div className="container mx-auto">
        <ProfileTabs username={username} />
      </div>
    </div>
  )
}
