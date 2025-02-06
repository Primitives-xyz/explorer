'use client'

import { Layout } from '@/components/Layout'
import { CreateProfile } from '@/components/profile/create-profile'
import { ProfileSection } from '@/components/ProfileSection'
import SearchBar from '@/components/SearchBar'
import { TopTraders } from '@/components/traders/TopTraders'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { ActivityFeedContainer } from '@/components/profile/FollowingContainer'
import { TrendingTokens } from '@/components/tokens/TrendingTokens'

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
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
        <SearchBar onPickRecentAddress={searchAddress} />

        {/* Grid layout for ProfileSection and TrendingTokens */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <ActivityFeedContainer username={mainUsername} />
          </div>
          <div className="lg:col-span-2">
            <ProfileSection
              walletAddress={''}
              hasSearched={hasSearched}
              profileData={profileData}
              error={error}
              isLoadingProfileData={isLoadingProfileData}
            />
          </div>
        </div>

        {/* Token results */}

        {/* Following list for logged-in users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendingTokens />
          <TopTraders />
        </div>
      </div>
      <CreateProfile />
    </Layout>
  )
}
