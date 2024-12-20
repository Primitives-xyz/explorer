'use client'

import { Layout } from '@/components/Layout'
import { ProfileSection } from '@/components/ProfileSection'
import SearchBar from '@/components/SearchBar'
import { TokenContainer } from '@/components/TokenContainer'
import { TransactionSection } from '@/components/TransactionSection'
import { useUserWallets } from '@dynamic-labs/sdk-react-core'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, useEffect, useState } from 'react'
import { getSwapTransactions } from '@/utils/api'

export default async function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userWallets = useUserWallets()
  const [walletAddress, setWalletAddress] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  const wallet = userWallets[0]
  const address = wallet?.address

  useEffect(() => {
    const addressFromUrl = searchParams.get('address')

    if (!initialLoadComplete) {
      if (addressFromUrl) {
        setWalletAddress(addressFromUrl)
        handleSearch()
      } else if (address) {
        setWalletAddress(address)
        handleSearch()
      }
      setInitialLoadComplete(true)
    }
  }, [searchParams, address, initialLoadComplete])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(e.target.value)
    setHasSearched(false)
  }

  const handleSearch = async () => {
    if (!walletAddress) return

    setIsSearching(true)
    try {
      if (initialLoadComplete) {
        const newUrl = `?address=${walletAddress}`
        router.push(newUrl)
      }
      setHasSearched(true)
    } finally {
      setIsSearching(false)
    }
  }

  const swapCount = await getSwapTransactions(address)

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
            />
          </div>
          <div className="w-full">
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
        <div className="mt-8">
          <div className="stats-card">
            <div className="stats-value">{swapCount}</div>
            <div className="stats-label">Swaps in 2024</div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
