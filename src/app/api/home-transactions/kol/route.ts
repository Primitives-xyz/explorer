import {
  ETransactionType,
  IExtendedHeliusTransaction,
  IHomeTransaction,
} from '@/components/home-transactions/home-transactions.models'
import { IGetProfilesResponse } from '@/components/tapestry/models/profiles.models'
import { fetchWrapper } from '@/utils/api'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// Add a unique cache tag
const KOL_CACHE_TAG = 'kol-transactions'

export async function GET(request: NextRequest) {
  try {
    // 1. Get all profiles in kolscan namespace
    // Getting only first page of profiles for now

    const profilesData = await fetchWrapper<IGetProfilesResponse>({
      endpoint: 'profiles',
      queryParams: {
        namespace: 'kolscan',
        // pageSize: 50,
      },
      // Add cache tag and force caching
      cache: 'force-cache',
      next: {
        tags: [KOL_CACHE_TAG],
        revalidate: 60, // Revalidate every 60 seconds
      },
    })

    const walletIds = profilesData?.profiles?.map(
      (profile) => profile.wallet?.address
    )

    // console.log('walletIds', walletIds?.length)

    // 2. Getting transactions for each wallet

    let allTransactions: IHomeTransaction[] = []

    for (const walletId of walletIds) {
      if (!walletId) continue

      // Getting wallet ids transactions from helius api

      const heliusTransactions = await fetchWrapper<
        IExtendedHeliusTransaction[]
      >({
        endpoint: 'helius-transactions',
        queryParams: {
          walletAddress: walletId,
          limit: 10,
          // before: allTransactions[allTransactions.length - 1]?.signature,
        },
        // Add cache tag and force caching
        cache: 'force-cache',
        next: {
          tags: [KOL_CACHE_TAG, `wallet-${walletId}`],
          revalidate: 60, // Revalidate every 60 seconds
        },
      })

      // Add profile information to each transaction
      const profile = profilesData.profiles.find(
        (profile) => profile.wallet?.address === walletId
      )

      const transactionsWithProfile: IHomeTransaction[] =
        heliusTransactions.map((transaction) => ({
          ...transaction,
          profile: profile?.profile,
        }))

      allTransactions.push(...transactionsWithProfile)
    }

    return NextResponse.json(
      allTransactions
        .filter((transaction) => transaction.type === ETransactionType.SWAP)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=60',
          'CDN-Cache-Control': 'public, max-age=60',
          'Vercel-CDN-Cache-Control': 'public, max-age=60',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching transactions:', error)

    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    )
  }
}

// Optional: Add a POST method to manually revalidate the cache when needed
export async function POST() {
  revalidateTag(KOL_CACHE_TAG)
  return NextResponse.json({ revalidated: true, now: Date.now() })
}
