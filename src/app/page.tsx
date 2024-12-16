'use client'

import { ActivityTape } from '@/components/ActivityTape'
import { Header } from '@/components/Header'
import { Layout } from '@/components/Layout'
import { ProfileSection } from '@/components/ProfileSection'
import SearchBar from '@/components/SearchBar'
import { TokenSection } from '@/components/TokenSection'
import { TransactionSection } from '@/components/TransactionSection'
import { ProfileWithStats } from '@/types'
import { getFollowStats, getProfiles } from '@/utils/api'
import {
  getTokens,
  getTransactionHistory,
  type FungibleToken,
  type Transaction,
} from '@/utils/helius'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [walletAddress, setWalletAddress] = useState('')
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([])
  const [tokens, setTokens] = useState<FungibleToken[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

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

    // Update URL with wallet address
    const newUrl = `?address=${walletAddress}`
    router.push(newUrl)

    setLoading(true)
    setError(null)
    setHasSearched(true)

    // Fetch data in parallel
    const fetchProfiles = async () => {
      try {
        const profilesData = await getProfiles(walletAddress)
        if (!profilesData.items || profilesData.items.length === 0) {
          setProfiles([])
          return
        }

        const profilesWithStats = await Promise.all(
          profilesData.items.map(async (profile) => {
            try {
              const stats = await getFollowStats(profile.profile.username)
              return { ...profile, followStats: stats }
            } catch (error) {
              return { ...profile, followStats: { followers: 0, following: 0 } }
            }
          }),
        )
        setProfiles(profilesWithStats)
      } catch (error) {
        console.error('Profiles fetch error:', error)
        setError((prev) =>
          prev
            ? `${prev}\nFailed to fetch profiles.`
            : 'Failed to fetch profiles.',
        )
        setProfiles([])
      }
    }

    const fetchTokens = async () => {
      try {
        const tokensData = await getTokens(walletAddress)
        console.log('Tokens received in component:', tokensData)
        setTokens(tokensData)
      } catch (error) {
        console.error('Tokens fetch error:', error)
        setError((prev) =>
          prev ? `${prev}\nFailed to fetch tokens.` : 'Failed to fetch tokens.',
        )
        setTokens([])
      }
    }

    const fetchTransactions = async () => {
      try {
        const transactionsData = await getTransactionHistory(
          walletAddress,
          undefined,
          10,
        )
        console.log('Transactions received:', transactionsData)
        setTransactions(transactionsData)
      } catch (error) {
        console.error('Transactions fetch error:', error)
        setError((prev) =>
          prev
            ? `${prev}\nFailed to fetch transactions.`
            : 'Failed to fetch transactions.',
        )
        setTransactions([])
      }
    }

    // Start all fetches in parallel
    Promise.all([fetchProfiles(), fetchTokens(), fetchTransactions()]).finally(
      () => {
        setLoading(false)
      },
    )
  }

  // Calculate total value of tokens
  const totalValue = tokens.reduce((acc, token) => {
    return acc + (token.price || 0) * token.balance
  }, 0)

  console.log(tokens)

  const clearError = () => {
    setError(null)
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
          loading={loading}
          hasSearched={hasSearched}
        />

        {error && (
          <div className="relative p-2 mb-4 border border-red-800 bg-red-900/20 text-red-400 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              onClick={clearError}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 hover:text-red-200 transition-colors"
              aria-label="Dismiss error"
            >
              ✕
            </button>
            <span>! ERROR: {error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          <div className="space-y-4 w-full overflow-hidden">
            {profiles.length > 0 && <ProfileSection profiles={profiles} />}
            <TokenSection
              tokens={tokens}
              totalValue={totalValue}
              isLoading={loading}
              hasSearched={hasSearched}
            />
          </div>

          <div className="space-y-4 w-full overflow-hidden">
            <TransactionSection
              transactions={transactions}
              isLoading={loading}
              hasSearched={hasSearched}
            />
          </div>
        </div>

        {!loading && profiles.length === 0 && !error && (
          <div className="text-center py-8 text-green-600 w-full">
            {'>>> WAITING FOR INPUT <<<'}
          </div>
        )}
      </div>
    </Layout>
  )
}
