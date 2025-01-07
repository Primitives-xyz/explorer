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
  const [searchQuery, setSearchQuery] = useState('')
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [error, setError] = useState<string | undefined>(undefined)
  const [isLoadingTokenData, setIsLoadingTokenData] = useState(false)
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
    setIsLoadingTokenData(true)
    setHasSearched(true)
    try {
      const response = await fetch(`/api/tokens/${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tokens')
      }
      const data = await response.json()
      setTokenData(data)
      router.push(`/${address}`)
    } catch (err) {
      console.error('Error fetching tokens:', err)
      setError('Failed to fetch tokens.')
    } finally {
      setIsLoadingTokenData(false)
    }
  }

  // Called when user clicks the [EXECUTE] button from the child form
  const handleSubmitSearch = () => {
    if (!searchQuery) return
    searchAddress(searchQuery)
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <SearchBar
          handleSearch={handleSubmitSearch}
          onPickRecentAddress={searchAddress}
        />

        {/* Grid layout for ProfileSection and TrendingTokens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProfileSection
            walletAddress={searchQuery}
            hasSearched={hasSearched}
            profileData={profileData}
            error={error}
            isLoadingProfileData={isLoadingProfileData}
          />
          <TrendingTokens />
        </div>

        {/* Token results */}
        {tokenData && (
          <TokenContainer
            walletAddress={searchQuery}
            hasSearched={hasSearched}
            tokenType="all"
            isLoading={isLoadingTokenData}
            tokenData={tokenData}
            error={error}
          />
        )}

        {/* Following list for logged-in users */}
        {mainUsername && <FollowingContainer username={mainUsername} />}
        {/* Top Traders Section */}
        <TopTraders />
      </div>
      <CreateProfile />
    </Layout>
  )
}
