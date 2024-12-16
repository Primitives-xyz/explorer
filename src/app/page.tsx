'use client'

import { ActivityTape } from '@/components/ActivityTape'
import { Header } from '@/components/Header'
import { Layout } from '@/components/Layout'
import { ProfileSection } from '@/components/ProfileSection'
import SearchBar from '@/components/SearchBar'
import { TokenSection } from '@/components/TokenSection'
import { TransactionSection } from '@/components/TransactionSection'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [walletAddress, setWalletAddress] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const addressFromUrl = searchParams.get('address')
    if (addressFromUrl && addressFromUrl !== walletAddress) {
      setWalletAddress(addressFromUrl)
      setHasSearched(false) // Reset search state for new address
    }
  }, [searchParams])

  useEffect(() => {
    if (walletAddress && !hasSearched) {
      handleSearch()
    }
  }, [walletAddress, hasSearched])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(e.target.value)
  }

  const handleSearch = async () => {
    if (!walletAddress) return

    setIsSearching(true)
    try {
      // Update URL with wallet address
      const newUrl = `?address=${walletAddress}`
      router.push(newUrl)
      setHasSearched(true)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <Layout>
      <div className="w-full overflow-hidden">
        <ActivityTape />
        <Header walletAddress={walletAddress} />
        <SearchBar
          walletAddress={walletAddress}
          handleInputChange={handleInputChange}
          handleSearch={handleSearch}
          loading={isSearching}
          hasSearched={hasSearched}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          <div className="space-y-4 w-full overflow-hidden">
            <ProfileSection
              walletAddress={walletAddress}
              hasSearched={hasSearched}
            />
            <TokenSection
              walletAddress={walletAddress}
              hasSearched={hasSearched}
            />
          </div>

          <div className="space-y-4 w-full overflow-hidden">
            <TransactionSection
              walletAddress={walletAddress}
              hasSearched={hasSearched}
            />
          </div>
        </div>

        {!hasSearched && (
          <div className="text-center py-8 text-green-600 w-full">
            {'>>> WAITING FOR INPUT <<<'}
          </div>
        )}
      </div>
    </Layout>
  )
}
