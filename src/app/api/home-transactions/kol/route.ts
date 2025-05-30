import {
  ETransactionType,
  IExtendedHeliusTransaction,
  IHomeTransaction,
} from '@/components/home-transactions/home-transactions.models'
import { IGetProfilesResponse } from '@/components/tapestry/models/profiles.models'
import { fetchWrapper } from '@/utils/api'
import { listCache } from '@/utils/redis'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check if we have cached KOL transactions
    const cacheKey = 'kol-transactions'
    const cachedData = await listCache.get(cacheKey)

    if (cachedData) {
      console.log('Cache hit for KOL transactions')
      return NextResponse.json(cachedData)
    }

    // 1. Get all profiles in kolscan namespace
    const profilesData = await fetchWrapper<IGetProfilesResponse>({
      endpoint: 'profiles',
      queryParams: {
        namespace: 'kolscan',
      },
    })

    const walletIds = profilesData?.profiles
      ?.map((profile) => profile.wallet?.address)
      .filter(Boolean)

    console.log('Processing', walletIds?.length, 'KOL wallets')

    // 2. Getting transactions for each wallet
    let allTransactions: IHomeTransaction[] = []

    // Process wallets in batches to avoid overwhelming the API
    const batchSize = 10
    for (let i = 0; i < walletIds.length; i += batchSize) {
      const batch = walletIds.slice(i, i + batchSize)

      const batchPromises = batch.map(async (walletId) => {
        try {
          // Check if we have cached transactions for this wallet
          const walletCacheKey = `wallet-txs:${walletId}`
          let heliusTransactions = await listCache.get(walletCacheKey)

          if (!heliusTransactions) {
            // Fetch from API if not cached
            heliusTransactions = await fetchWrapper<
              IExtendedHeliusTransaction[]
            >({
              endpoint: 'helius-transactions',
              queryParams: {
                walletAddress: walletId as string,
                limit: 10,
              },
            })

            // Cache wallet transactions for 5 minutes
            if (heliusTransactions) {
              await listCache.set(walletCacheKey, heliusTransactions, 300)
            }
          }

          // Add profile information to each transaction
          const profile = profilesData.profiles.find(
            (profile) => profile.wallet?.address === walletId
          )

          const transactionsWithProfile: IHomeTransaction[] = (
            heliusTransactions as IExtendedHeliusTransaction[]
          ).map((transaction) => ({
            ...transaction,
            profile: profile?.profile,
          }))

          return transactionsWithProfile
        } catch (error) {
          console.error(
            `Error fetching transactions for wallet ${walletId}:`,
            error
          )
          return []
        }
      })

      const batchResults = await Promise.all(batchPromises)
      allTransactions.push(...batchResults.flat())
    }

    // Filter and sort transactions
    const filteredTransactions = allTransactions
      .filter((transaction) => transaction.type === ETransactionType.SWAP)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

    // Cache the final result for 1 minute
    await listCache.set(cacheKey, filteredTransactions, 60)

    return NextResponse.json(filteredTransactions)
  } catch (error) {
    console.error('Error fetching KOL transactions:', error)

    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
