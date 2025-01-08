'use client'

import { Layout } from '@/components/Layout'
import { CreateProfile } from '@/components/profile/create-profile'
import { ProfileSection } from '@/components/ProfileSection'
import SearchBar from '@/components/SearchBar'
import { TokenContainer } from '@/components/TokenContainer'
import { TrendingTokens } from '@/components/tokens/TrendingTokens'
import { TopTraders } from '@/components/traders/TopTraders'
import { FungibleToken, NFT } from '@/utils/types'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { FollowingContainer } from '@/components/profile/FollowingContainer'

interface TokenData {
  items: (FungibleToken | NFT)[]
  nativeBalance: {
    lamports: number
    price_per_sol: number
    total_price: number
  }
}

interface ProfileData {
  profiles: any[]
}

export default function Home() {
  const router = useRouter()
  const { mainUsername } = useCurrentWallet()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [error, setError] = useState<string | undefined>(undefined)
  const [isLoadingProfileData, setIsLoadingProfileData] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Initial fetch of profiles when page loads
  useEffect(() => {
    fetchProfiles()
  }, [])

  // Add new function to fetch profiles
  async function fetchProfiles() {
    setError(undefined)
    setIsLoadingProfileData(true)
    try {
      const url = '/api/profiles'
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch profiles')
      }
      const data = await response.json()
      setProfileData(data)
    } catch (err) {
      console.error('Error fetching profiles:', err)
      setError('Failed to fetch profiles.')
    } finally {
      setIsLoadingProfileData(false)
    }
  }

  // Add function to search address
  const searchAddress = async (address: string) => {
    setHasSearched(true)
    try {
      router.push(`/${address}`)
    } catch (err) {
      console.error('Error fetching tokens:', err)
      setError('Failed to fetch tokens.')
    } finally {
    }
  }

  // Called when user clicks the [EXECUTE] button from the child form
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <SearchBar onPickRecentAddress={searchAddress} />

        {/* Grid layout for ProfileSection and TrendingTokens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProfileSection
            walletAddress={''}
            hasSearched={hasSearched}
            profileData={profileData}
            error={error}
            isLoadingProfileData={isLoadingProfileData}
          />
          <TrendingTokens />
        </div>

        {/* Token results */}

        {/* Following list for logged-in users */}
        {mainUsername && <FollowingContainer username={mainUsername} />}
        {/* Top Traders Section */}
        <TopTraders />
      </div>
      <CreateProfile />
    </Layout>
  )
}
