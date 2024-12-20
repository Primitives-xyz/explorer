'use client'

import { Layout } from '@/components/Layout'
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wallet = userWallets[0]
  const address = wallet?.address

  useEffect(() => {
    const addressFromUrl = searchParams.get('address')

    if (!initialLoadComplete) {
      if (addressFromUrl) {
        setWalletAddress(addressFromUrl)
        setHasSearched(true)
        fetchTokens()
      } else if (address) {
        setWalletAddress(address)
        setHasSearched(true)
        fetchTokens()
      }
      setInitialLoadComplete(true)
    }
  }, [searchParams, address, initialLoadComplete])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(e.target.value)
    setHasSearched(false)
    setTokenData(null)
  }

  const fetchTokens = async () => {
    if (!walletAddress) return

    setIsLoading(true)
    setError(null)
    setTokenData(null)

    try {
      const response = await fetch(
        `/api/tokens?address=${walletAddress}&type=all`,
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if ('error' in data) {
        throw new Error(data.error)
      }

      setTokenData(data)
    } catch (error) {
      console.error('Error fetching tokens:', error)
      setError('Failed to fetch tokens.')
      setTokenData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!walletAddress) return

    setIsSearching(true)
    setTokenData(null)
    try {
      if (initialLoadComplete) {
        const newUrl = `?address=${walletAddress}`
        router.push(newUrl)
      }
      setHasSearched(true)
      await fetchTokens()
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <Layout>
      <div className="w-full overflow-hidden">
        <SearchBar
          walletAddress={walletAddress}
          handleInputChange={handleInputChange}
          handleSearch={handleSearch}
          loading={isSearching}
          hasSearched={hasSearched}
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
