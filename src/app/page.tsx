'use client'

import { Layout } from '@/components/Layout'
import { CreateProfile } from '@/components/profile/create-profile'
import { ProfileSection } from '@/components/ProfileSection'
import SearchBar from '@/components/SearchBar'
import { TokenContainer } from '@/components/TokenContainer'
import { FungibleToken, NFT } from '@/utils/types'
import { useUserWallets } from '@dynamic-labs/sdk-react-core'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, useEffect, useState } from 'react'

interface TokenData {
  items: (FungibleToken | NFT)[]
  nativeBalance: {
    lamports: number
    price_per_sol: number
    total_price: number
  }
}

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userWallets = useUserWallets()

  const [walletAddress, setWalletAddress] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wallet = userWallets[0]
  const connectedWalletAddr = wallet?.address

  // On mount or when URL param changes, set walletAddress & trigger fetch
  useEffect(() => {
    const addressFromUrl = searchParams.get('address')
    if (addressFromUrl) {
      setWalletAddress(addressFromUrl)
      setHasSearched(true)
      fetchTokens(addressFromUrl)
    } else if (connectedWalletAddr && !walletAddress) {
      setWalletAddress(connectedWalletAddr)
      // Don't auto-search when setting connected wallet
    }
  }, [searchParams]) // Only depend on searchParams

  // Single function that fetches tokens for a given address
  async function fetchTokens(addr: string) {
    setIsLoading(true)
    setError(null)
    setTokenData(null)
    try {
      const response = await fetch(`/api/tokens?address=${addr}&type=all`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if ('error' in data) {
        throw new Error(data.error)
      }
      setTokenData(data)
    } catch (err) {
      console.error('Error fetching tokens:', err)
      setError('Failed to fetch tokens.')
      setTokenData(null)
    } finally {
      setIsLoading(false)
    }
  }

  // The "unified" search action that updates state + pushes URL + fetches in one go
  async function searchAddress(newAddress: string) {
    if (!newAddress) return
    setIsSearching(true)
    setWalletAddress(newAddress)
    setHasSearched(true)
    setTokenData(null)

    // Refresh the URL param
    router.push(`?address=${newAddress}`)

    try {
      await fetchTokens(newAddress)
    } finally {
      setIsSearching(false)
    }
  }

  // For typing in the input (as opposed to the dropdown):
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(e.target.value)
    // Don't reset hasSearched or tokenData while typing
  }

  // Called when user clicks the [EXECUTE] button from the child form
  // or presses Enter in the input
  const handleSubmitSearch = () => {
    if (!walletAddress) return
    setHasSearched(true)
    searchAddress(walletAddress)
  }

  return (
    <Layout>
      <div className="w-full overflow-hidden">
        <CreateProfile
          onProfileCreated={() => {
            if (connectedWalletAddr) {
              searchAddress(connectedWalletAddr)
            }
          }}
        />
        <SearchBar
          walletAddress={walletAddress}
          handleInputChange={handleInputChange}
          handleSearch={handleSubmitSearch}
          loading={isSearching}
          hasSearched={hasSearched}
          onPickRecentAddress={searchAddress}
        />
        <div className="space-y-4 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
            <ProfileSection
              walletAddress={walletAddress}
              hasSearched={hasSearched}
            />
            <TokenContainer
              walletAddress={walletAddress}
              hasSearched={hasSearched}
              tokenType="fungible"
              view="tokens"
              tokenData={tokenData}
              isLoading={isLoading}
              error={error}
            />
          </div>
          <div className="w-full">
            <TokenContainer
              walletAddress={walletAddress}
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
