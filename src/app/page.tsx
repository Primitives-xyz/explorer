'use client'

import { Layout } from '@/components/Layout'
import { CreateProfile } from '@/components/profile/create-profile'
import { ProfileSection } from '@/components/ProfileSection'
import SearchBar from '@/components/SearchBar'
import { TokenContainer } from '@/components/TokenContainer'
import { FungibleToken, NFT } from '@/utils/types'
import { useUserWallets } from '@dynamic-labs/sdk-react-core'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, useEffect, useState } from 'react'
import { FollowingList } from '@/components/profile/FollowingList'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'

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
  const pathname = usePathname()
  const { walletAddress: currentWalletAddress, mainUsername } =
    useCurrentWallet()

  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false)

  // Initial fetch of profiles when page loads
  useEffect(() => {
    fetchProfiles()
  }, [])

  // Clear states when component mounts or pathname changes
  useEffect(() => {
    const clearStates = () => {
      setIsSearching(false)
      setTokenData(null)
      setIsLoading(false)
      setError(null)
    }

    clearStates()

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('a')) {
        clearStates()
      }
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [pathname])

  // Add new function to fetch profiles
  async function fetchProfiles() {
    setProfileError(null)
    setIsLoadingProfiles(true)
    try {
      const url = '/api/profiles'
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if ('error' in data) {
        throw new Error(data.error)
      }
      setProfileData(data)
    } catch (err) {
      console.error('Error fetching profiles:', err)
      setProfileError('Failed to fetch profiles.')
    } finally {
      setIsLoadingProfiles(false)
    }
  }

  // The "unified" search action that updates state + pushes URL + fetches in one go
  async function searchAddress(newAddress: string) {
    if (!newAddress) return
    router.push(`/${newAddress}`)
  }

  // Called when user clicks the [EXECUTE] button from the child form
  const handleSubmitSearch = () => {
    if (!currentWalletAddress) return
    searchAddress(currentWalletAddress)
  }

  return (
    <Layout>
      <div className="w-full overflow-hidden">
        <CreateProfile onProfileCreated={() => {}} />
        <SearchBar
          walletAddress={currentWalletAddress}
          handleSearch={handleSubmitSearch}
          loading={isSearching}
          hasSearched={hasSearched}
          onPickRecentAddress={searchAddress}
        />
        <div className="space-y-4 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
            <div className="w-full h-full">
              <ProfileSection
                walletAddress={currentWalletAddress}
                hasSearched={hasSearched}
                profileData={profileData}
                error={profileError}
                isLoadingProfileData={isLoadingProfiles}
              />
            </div>
            <div className="w-full h-full">
              <TokenContainer
                walletAddress={currentWalletAddress}
                hasSearched={hasSearched}
                tokenType="fungible"
                view="tokens"
                tokenData={tokenData}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>
          {mainUsername && (
            <div className="w-full">
              <FollowingList username={mainUsername} />
            </div>
          )}
          <div className="w-full">
            <TokenContainer
              walletAddress={currentWalletAddress}
              hasSearched={hasSearched}
              tokenType="all"
              view="nfts"
              tokenData={tokenData}
              isLoading={isLoading}
              error={error}
            />
          </div>
          {!hasSearched && (
            <div className="text-center py-8 text-green-600 w-full">
              {'>>> WAITING FOR INPUT <<<'}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
